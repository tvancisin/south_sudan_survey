<script>
  import { onMount } from "svelte";
  import { getCSV, getGeo, monthMap, spike, angledSpike } from "./utils";
  import * as d3 from "d3";
  import Lolly from "./lib/Lolly.svelte";
  import List from "./lib/List.svelte";
  import Map from "./lib/Map.svelte";
  import Legend from "./lib/Legend.svelte";
  import Spikes from "./lib/Spikes.svelte";
  import Time from "./lib/Time.svelte";
  import Sorted from "./lib/Sorted.svelte";
  import Bars from "./lib/Bars.svelte";
  import Elections from "./lib/Elections.svelte";

  let width,
    height,
    survey_data,
    default_survey_data,
    geo_data,
    indy_locs,
    projected_locations,
    polygon_data = [],
    aggregatedLocations,
    elections,
    wavePeriods,
    timeScale,
    location_groups,
    bars = false,
    elections_check = false,
    axisGroup,
    isListVisible = false,
    header = "Overall Safety Across South Sudan",
    test,
    csv_path = ["./data/ssd_surveys.csv"],
    geojson_path = ["./data/nile.json", "./data/country_polygons.json"],
    margin = { top: 30, bottom: 30, left: 30, right: 30 };

  // Bound values for dropdowns
  let selectedEnv = "all";
  let selectedTopic = "";

  let menuOpen = false;
  let isMobile = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  // detect mobile / screen resize
  function updateScreenSize() {
    isMobile = window.innerWidth < 768;
  }

  onMount(() => {
    // ---------------------
    // Async data loading
    // ---------------------
    (async () => {
      // load CSV
      const csv = await getCSV(csv_path);
      survey_data = csv[0];
      default_survey_data = csv[0];

      // prepare timeline
      let timeline = d3.groups(survey_data, (d) => d.Wave);
      wavePeriods = timeline.map(([waveName, items]) => {
        const first = items[0];
        const year = +first.wave_year;
        const startMonth = monthMap[first.wave_month_start];
        const endMonth = monthMap[first.wave_month_end];

        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0);

        return { wave: waveName, start: startDate, end: endDate };
      });

      // load GeoJSON
      const geo = await getGeo(geojson_path);
      geo_data = geo[0].features;
      polygon_data = geo[1].features;
    })();

    // ---------------------
    // Responsive mobile detection
    // ---------------------
    // fallback for normal window resizing
    updateScreenSize();

    // reliable listener for mobile / DevTools device toolbar
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    function handleMediaChange(e) {
      isMobile = e.matches;
    }

    handleMediaChange(mediaQuery); // initial check
    mediaQuery.addEventListener("change", handleMediaChange);

    // ---------------------
    // Cleanup on unmount
    // ---------------------
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  });

  // once loaded, prepare data
  let current_mean = "overall_sec_mean_score";
  $: if (survey_data) {
    // group by locations
    const pocOrder = ["POC", "IDP", "Other"];
    location_groups = d3
      .groups(
        survey_data,
        (d) => d.ADM2,
        (d) => d.poc,
      )
      .map(([adm2, pocGroups]) => [
        adm2,
        pocGroups.sort(
          (a, b) => pocOrder.indexOf(a[0]) - pocOrder.indexOf(b[0]),
        ),
      ]);

    // create objects with location, overall mean and name
    aggregatedLocations = location_groups.flatMap(([adm2, pocGroups]) => {
      const n = pocGroups.length; // number of subgroups

      return pocGroups.map(([poc, items], i) => {
        const overall_scores = items
          .map((d) => +d[current_mean])
          .filter((v) => v && !isNaN(v)); // remove 0, null, undefined, NaN

        const meanScore = d3.mean(overall_scores);
        const lat = +items[0].central_latitude;
        const lon = +items[0].central_longitude;
        const coords = projection([lon, lat]);
        const env = items[0].environment_type;

        // --- horizontal offset logic ---
        const spacing = 10; // pixel spacing
        const xOffset = (i - (n - 1) / 2) * spacing;
        const x = coords?.[0] + xOffset;
        const y = coords?.[1]; // same vertical position
        return {
          adm2,
          poc,
          env,
          x,
          y,
          meanScore,
        };
      });
    });
    aggregatedLocations.sort((a, b) => b.meanScore - a.meanScore);

    const electionsMap = {
      Soon: 3,
      Delayed: 2,
      Never: 1,
    };

    elections = location_groups.flatMap(([adm2, pocGroups]) => {
      const n = pocGroups.length; // number of subgroups

      return pocGroups.map(([poc, items], i) => {
        // Map category to numeric values, ignore "Not Answered"
        const numericScores = items
          .map((d) => electionsMap[d.elections_held_category])
          .filter((v) => v !== undefined && !isNaN(v));

        const meanScore = d3.mean(numericScores);
        const lat = +items[0].central_latitude;
        const lon = +items[0].central_longitude;
        const coords = projection([lon, lat]);
        const env = items[0].environment_type;

        // --- horizontal offset logic ---
        const spacing = 10; // pixel spacing
        const xOffset = (i - (n - 1) / 2) * spacing;
        const x = coords?.[0] + xOffset;
        const y = coords?.[1]; // same vertical position

        return {
          adm2,
          poc,
          env,
          x,
          y,
          meanScore,
        };
      });
    });

    elections.sort((a, b) => b.meanScore - a.meanScore);

    // individual locations for labels
    projected_locations = survey_data.map((d) => {
      const coords = projection([+d.central_longitude, +d.central_latitude]);
      return { ...d, x: coords?.[0], y: coords?.[1] };
    });

    indy_locs = d3.groups(projected_locations, (d) => d.ADM2);
    //party politics data
    test = location_groups.flatMap(([adm2, pocGroups]) => {
      const n = pocGroups.length; // number of subgroups (POC, IDP, Other)

      return pocGroups.map(([poc, items], i) => {
        const lat = +items[0].central_latitude;
        const lon = +items[0].central_longitude;
        const coords = projection([lon, lat]);
        const env = items[0].environment_type;

        // --- horizontal offset logic ---
        const spacing = 9;
        const xOffset = (i - (n - 1) / 2) * spacing;
        const x = coords?.[0] + xOffset;
        const y = coords?.[1];

        // --- Party_Vision counts ---
        const visionCounts = d3.rollup(
          items.filter((d) => d.Party_Vision && d.Party_Vision.trim() !== ""),
          (arr) => arr.length,
          (d) => d.Party_Vision,
        );

        // Convert Map → sorted array
        const sortedVisionCounts = Array.from(
          visionCounts,
          ([Party_Vision, count]) => ({
            Party_Vision,
            count,
          }),
        ).sort((a, b) => d3.descending(a.count, b.count));

        // Define the main three
        const mainParties = [
          "Sudan People’s Liberation Movement In Government (SPLM-IG)",
          "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
          "None of the parties",
        ];

        // Separate them
        const main = sortedVisionCounts.filter((d) =>
          mainParties.includes(d.Party_Vision),
        );

        // Combine everything else into “Other parties”
        const otherSum = d3.sum(
          sortedVisionCounts
            .filter((d) => !mainParties.includes(d.Party_Vision))
            .map((d) => d.count),
        );

        // Add the “Other parties” entry
        const filteredVisionCounts = [
          ...main,
          { Party_Vision: "Other parties", count: otherSum },
        ];

        // Optional: enforce consistent order
        const partyOrder = [
          "Sudan People’s Liberation Movement In Government (SPLM-IG)",
          "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
          "None of the parties",
          "Other parties",
        ];
        filteredVisionCounts.sort(
          (a, b) =>
            partyOrder.indexOf(a.Party_Vision) -
            partyOrder.indexOf(b.Party_Vision),
        );

        return {
          adm2,
          poc,
          env,
          x,
          y,
          filteredVisionCounts,
        };
      });
    });
  }

  $: projection = (() => {
    let scaleFactor;

    if (width >= 1200) {
      // large screens
      scaleFactor = 3;
    } else if (width >= 768) {
      // medium screens
      scaleFactor = 3.5; // adjust as needed
    } else {
      // small screens
      scaleFactor = 6; // adjust as needed
    }

    return d3
      .geoMercator()
      .center([30, 7.5]) // center on South Sudan
      .scale(width * scaleFactor)
      .translate([width / 2, height / 2]);
  })();

  // draw geojson polygons
  $: pathGenerator = d3.geoPath().projection(projection);

  let heightScale = d3
    .scaleLinear()
    .domain([1, 5]) // linear scale from 0 to 5
    .range([120, 2]); // heights from 120px (low values) to 10px (high values)

  // Color scale (optional)
  const colorScale = d3
    .scaleOrdinal()
    .domain(["POC", "IDP", "Other"]) // list all possible values
    .range(["white", "#808080", "black"]); // or any colors you like

  function handleEnvClick(which) {
    heightScale.domain([1, 5]).range([120, 2]);
    current_mean = "overall_sec_mean_score";
    let filtered_data;
    if (which == "poc") {
      filtered_data = default_survey_data.filter((d) => d.poc == "POC");
    } else if (which == "idp") {
      filtered_data = default_survey_data.filter((d) => d.poc == "IDP");
    } else if (which == "oth") {
      filtered_data = default_survey_data.filter((d) => d.poc == "Other");
    } else if (which == "poc_idp") {
      filtered_data = default_survey_data.filter(
        (d) => d.poc == "POC" || d.poc == "IDP",
      );
    } else {
      filtered_data = default_survey_data;
    }
    survey_data = filtered_data;
  }

  function handleTopicClick(which) {
    elections_check = false;
    bars = false;
    heightScale.domain([1, 5]).range([120, 2]);
    let filtered_data = default_survey_data;
    if (which == "road") {
      header = "Road Safety Across South Sudan";
      current_mean = "Sec_Roads_Now_N";
    } else if (which == "countryside") {
      current_mean = "Sec_Countryside_Now_N";
      header = "Countryside Safety Across South Sudan";
    } else if (which == "neighbour") {
      current_mean = "Sec_Nbr_Now_N";
      header = "Neighbourhood Safety Across South Sudan";
    } else if (which == "buy") {
      current_mean = "Sec_Buy_Now_N";
      header = "Shopping Safety Across South Sudan";
    } else if (which == "culture") {
      current_mean = "Sec_Cul_Now_N";
      header = "Cultural Events Safety Across South Sudan";
    } else if (which == "overall") {
      current_mean = "overall_sec_mean_score";
      header = "Overall Safety Across South Sudan";
    }

    survey_data = filtered_data;
  }

  function handleWaveClick(wave) {
    heightScale.domain([1, 5]).range([120, 2]);
    const wav = wave.detail.wave;
    let filtered_data = default_survey_data.filter((d) => d.Wave == wav);
    survey_data = filtered_data;
  }

  function handleGunsClick() {
    elections_check = false;
    bars = false;
    survey_data = default_survey_data;
    heightScale.domain([1, 3]).range([1, 80]);
    current_mean = "Sec_Gunshots_Now_N";
    header = "Gunshots Heard at Night Across South Sudan";
  }

  function handlePoliticsClick() {
    current_mean = "overall_sec_mean_score";
    bars = true;
    elections_check = false;
    header = "Political Party Preferences Across South Sudan";
  }

  function handleElectionsClick() {
    bars = false;
    elections_check = true;
  }

  let open = false;

  const topics = [
    { value: "overall", label: "Overall" },
    { value: "road", label: "Roads" },
    { value: "countryside", label: "Countryside" },
    { value: "buy", label: "Shopping" },
    { value: "neighbour", label: "Neighbour" },
    { value: "culture", label: "Cultural Events" },
  ];

  function handleSelect(topic) {
    selectedTopic = topic;
    handleTopicClick(topic);
    open = false;
  }
</script>

<main>
  <h1>{header}</h1>
  <div class="environment_buttons">
    <label for="envSelect">Environment</label>
    <select
      id="envSelect"
      bind:value={selectedEnv}
      on:change={() => handleEnvClick(selectedEnv)}
    >
      <option value="poc_idp">POC+IDP</option>
      <option value="poc">POC</option>
      <option value="idp">IDP</option>
      <option value="oth">Other</option>
      <option value="all">All</option>
    </select>
  </div>

  {#if !isMobile}
    <div class="buttons-container">
      <div class="dropdown">
        <div class="button">Safety</div>
        <div class="menu">
          {#each topics as t}
            <button
              style="font-family: 'Montserrat';"
              on:click={() => handleSelect(t.value)}
            >
              {t.label}
            </button>
          {/each}
        </div>
      </div>

      <button class="guns_button" on:click={handleGunsClick}>Gunshots</button>
      <button class="politics_button" on:click={handlePoliticsClick}
        >Politics</button
      >
      <button class="elections_button" on:click={handleElectionsClick}
        >Elections</button
      >
    </div>
  {:else}
    <div class="burger-menu">
      <button class="burger-icon" on:click={toggleMenu}> &#9776; </button>
      {#if menuOpen}
        <div class="burger-dropdown">
          <div class="dropdown">
            <div class="button">Safety</div>
            <div class="menu">
              {#each topics as t}
                <button
                  style="font-family: 'Montserrat';"
                  on:click={() => handleSelect(t.value)}
                >
                  {t.label}
                </button>
              {/each}
            </div>
          </div>

          <button on:click={handleGunsClick}>Gunshots</button>
          <button on:click={handlePoliticsClick}>Politics</button>
          <button on:click={handleElectionsClick}>Elections</button>
        </div>
      {/if}
    </div>
  {/if}
  <!-- <button class="list_button" on:click={() => (isListVisible = !isListVisible)}>
    {isListVisible ? "Hide List" : "Show List"}
  </button> -->
  <!-- <List {aggregatedLocations} /> -->

  <div class="map" bind:clientWidth={width} bind:clientHeight={height}>
    <svg {width} {height}>
      {#if polygon_data && geo_data}
        <Map {polygon_data} {geo_data} {pathGenerator} {width} />
      {/if}

      {#if width && height && aggregatedLocations}
        <!-- <Legend
          {heightScale}
          {margin}
          {height}
          {width}
          {current_mean}
          {spike}
          {bars}
          {elections_check}
        /> -->
        {#if bars}
          <Bars
            {test}
            {indy_locs}
            {current_mean}
            {aggregatedLocations}
            {colorScale}
          />
        {:else if elections_check}
          <Elections {elections} {colorScale} {indy_locs} />
        {:else if current_mean == "Sec_Gunshots_Now_N"}
          <!-- <Spikes
            {aggregatedLocations}
            {heightScale}
            {colorScale}
            {spike}
            {angledSpike}
            {indy_locs}
          /> -->
          <Lolly
            {aggregatedLocations}
            {current_mean}
            {colorScale}
            {indy_locs}
          />
        {:else}
          <Lolly
            {aggregatedLocations}
            {current_mean}
            {colorScale}
            {indy_locs}
          />
        {/if}
      {/if}
    </svg>
    <!-- {#if wavePeriods}
      <Time
        {wavePeriods}
        {timeScale}
        {height}
        {width}
        {margin}
        {axisGroup}
        on:waveClick={handleWaveClick}
      />
    {/if} -->
    <Sorted
      {aggregatedLocations}
      {test}
      {colorScale}
      {height}
      {width}
      {current_mean}
      {heightScale}
      {bars}
      {elections_check}
      {elections}
      {spike}
      {angledSpike}
    />
  </div>
</main>

<style>
  main {
    position: absolute;
    width: 100%;
    height: 100vh;
  }

  h1 {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Montserrat";
    font-weight: 600;
    font-size: 20px;
    margin: 0;
    padding: 0;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .environment_buttons {
    position: absolute;
    top: 5px;
    display: flex;
    flex-direction: column;
    width: 140px;
  }

  .environment_buttons {
    right: 5px;
  }

  .environment_buttons label {
    font-size: 14px;
    margin-bottom: 2px;
  }

  .environment_buttons select {
    width: 100%;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .buttons-container {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  .guns_button {
    background-color: #f2f2f2;
    position: absolute;
    top: 45px;
    left: 5px;
    padding: 6px 12px;
    font-family: "Montserrat";
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .politics_button {
    background-color: #f2f2f2;
    position: absolute;
    font-family: "Montserrat";
    top: 85px;
    left: 5px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .elections_button {
    background-color: #f2f2f2;
    position: absolute;
    font-family: "Montserrat";
    top: 125px;
    left: 5px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  label {
    font-family: "Montserrat";
    font-weight: 500;
  }

  .button {
    background-color: #f2f2f2;
    position: absolute;
    font-family: "Montserrat";
    top: 5px;
    left: 5px;
    border: 2px solid black;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .button:hover {
    background-color: #e0e0e0;
  }

  .menu {
    display: none;
    left: 70px;
    top: 10px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-top: 0px;
    position: absolute;
    width: 130px;
    z-index: 10;
    font-family: "Monteserrat";
  }

  .dropdown:hover .menu {
    display: block;
  }

  .menu button {
    display: block;
    width: 100%;
    padding: 6px 10px;
    text-align: left;
    border: none;
    background: white;
    cursor: pointer;
  }

  .menu button:hover {
    background-color: #eee;
  }

  .burger-menu {
    position: absolute;
    top: 5px;
    left: 5px;
  }

  .burger-icon {
    background-color: #f2f2f2;
    border: 2px solid #000;
    border-radius: 4px;
    font-size: 20px;
    padding: 6px 10px;
    cursor: pointer;
    font-family: "Montserrat";
  }

  .burger-dropdown {
    display: flex;
    flex-direction: column;
    margin-top: 5px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 140px;
    padding: 6px;
    z-index: 20;
  }

  .burger-dropdown button {
    margin: 4px 0;
    background-color: #f2f2f2;
    border: none;
    padding: 6px 8px;
    text-align: left;
    border-radius: 3px;
    font-family: "Montserrat";
    font-size: 14px;
    cursor: pointer;
  }

  .burger-dropdown .button {
    width: 115px;
    left: 0px;
    margin-bottom: 8px;
    background-color: #f2f2f2;
    font-family: "Montserrat";
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
    border: none; /* remove black border */
    text-align: left;
    position: relative;
  }

  .burger-dropdown .menu {
    left: 100px;
    top: 50px;
  }

  .burger-dropdown button:hover {
    background-color: #e0e0e0;
  }
</style>
