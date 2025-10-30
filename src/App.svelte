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
    disputed_data = [],
    aggregatedLocations,
    elections,
    wavePeriods,
    timeScale,
    location_groups,
    bars = false,
    elections_check = false,
    open = false,
    current_location,
    axisGroup,
    isListVisible = false,
    header = "Overall Safety",
    test,
    csv_path = ["./data/ssd_surveys.csv"],
    geojson_path = [
      "./data/nile.json",
      "./data/country_polygons.json",
      "./data/disputed.json",
    ],
    margin = { top: 30, bottom: 30, left: 30, right: 30 };

  // Bound values for dropdowns
  let selectedEnv = "all";
  let selectedTopic = "";

  let menuOpen = false;
  let menuEnvOpen = false;
  let isMobile = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
  function toggleEnvMenu() {
    menuEnvOpen = !menuEnvOpen;
  }

  // detect mobile / screen resize
  function updateScreenSize() {
    isMobile = window.innerWidth < 768;
  }

  onMount(() => {
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
      disputed_data = geo[2].features;
    })();

    // fallback for normal window resizing
    updateScreenSize();

    // reliable listener for mobile / DevTools device toolbar
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    function handleMediaChange(e) {
      isMobile = e.matches;
    }

    handleMediaChange(mediaQuery); // initial check
    mediaQuery.addEventListener("change", handleMediaChange);

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

  //change projection scaling based on screen size
  $: projection = (() => {
    let scaleFactor, y_center;
    if (width >= 1200) {
      // large screens
      scaleFactor = 2.5;
      y_center = 7.5;
    } else if (width >= 768) {
      // medium screens
      scaleFactor = 3.5; // adjust as needed
      y_center = 7.5;
    } else {
      // small screens
      scaleFactor = 6.5; // adjust as needed
      y_center = 6.2;
    }

    return d3
      .geoMercator()
      .center([29.6, y_center]) // center on South Sudan
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
    selectedEnv = which;
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
    activeButton = "safety";
    elections_check = false;
    bars = false;
    heightScale.domain([1, 5]).range([120, 2]);
    let filtered_data = default_survey_data;
    if (which == "road") {
      header = "Road Safety";
      current_mean = "Sec_Roads_Now_N";
    } else if (which == "countryside") {
      current_mean = "Sec_Countryside_Now_N";
      header = "Countryside Safety";
    } else if (which == "neighbour") {
      current_mean = "Sec_Nbr_Now_N";
      header = "Neighbourhood Safety";
    } else if (which == "buy") {
      current_mean = "Sec_Buy_Now_N";
      header = "Shopping Safety";
    } else if (which == "culture") {
      current_mean = "Sec_Cul_Now_N";
      header = "Cultural Events Safety";
    } else if (which == "overall") {
      current_mean = "overall_sec_mean_score";
      header = "Overall Safety";
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
    activeButton = "guns";
    elections_check = false;
    bars = false;
    survey_data = default_survey_data;
    heightScale.domain([1, 3]).range([1, 80]);
    current_mean = "Sec_Gunshots_Now_N";
    header = "Gunshots at Night";
  }

  function handlePoliticsClick() {
    activeButton = "politics";
    current_mean = "overall_sec_mean_score";
    bars = true;
    elections_check = false;
    header = "Political Preferences";
  }

  function handleElectionsClick() {
    activeButton = "elections";
    bars = false;
    elections_check = true;
    header = "Wanting an Election";
  }

  const topics = [
    { value: "overall", label: "Overall" },
    { value: "road", label: "Roads" },
    { value: "countryside", label: "Countryside" },
    { value: "buy", label: "Shopping" },
    { value: "neighbour", label: "Neighbour" },
    { value: "culture", label: "Cultural Events" },
  ];

  function handleSelect(topic) {
    activeButton = "select";
    selectedTopic = topic;
    handleTopicClick(topic);
    open = false;
  }

  const options = [
    { value: "poc_idp", label: "POC+IDP" },
    { value: "poc", label: "POC" },
    { value: "idp", label: "IDP" },
    { value: "oth", label: "Other" },
    { value: "all", label: "All" },
  ];

  let activeButton = "safety";
  let activeEnvButton = "all";

  let map_shrink = false;
  let keep_width;
  function handleBarClick(event) {
    map_shrink = true;
    keep_width = width;
    width = width * 0.7;
    const details = event.detail.value;
    current_location = details;
    console.log("Received in App:", details);
    isListVisible = true;
  }

  function closeList() {
    isListVisible = false;
    width = keep_width; 
  }
</script>

<main>
  <h1>{header}</h1>
  <!-- environment -->
  {#if !isMobile}
    <div class="environment_buttons">
      {#each options as opt}
        <button
          class:selected={opt.value === selectedEnv}
          on:click={() => handleEnvClick(opt.value)}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  {:else}
    <div class="env_burger-menu">
      <button class="env_burger-icon" on:click={toggleEnvMenu}>☰</button>
      {#if menuEnvOpen}
        <div class="env_burger-dropdown">
          {#each options as opt}
            <button
              class:selected={opt.value === selectedEnv}
              on:click={() => {
                handleEnvClick(opt.value);
                menuEnvOpen = false;
              }}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- topics  -->
  {#if !isMobile}
    <div class="buttons-container">
      <div class="dropdown">
        <div class="button" class:active={activeButton === "safety"}>
          Safety
        </div>
        <div class="menu">
          {#each topics as t}
            <button on:click={() => handleSelect(t.value)}>
              {t.label}
            </button>
          {/each}
        </div>
      </div>

      <button
        class="guns_button"
        class:active={activeButton === "guns"}
        on:click={handleGunsClick}
      >
        Gunshots
      </button>

      <button
        class="politics_button"
        class:active={activeButton === "politics"}
        on:click={handlePoliticsClick}
      >
        Politics
      </button>

      <button
        class="elections_button"
        class:active={activeButton === "elections"}
        on:click={handleElectionsClick}
      >
        Elections
      </button>
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
  {#if isListVisible}
    <List {aggregatedLocations} {current_location} {default_survey_data} on:barClick={closeList} />
  {/if}

  <div class="map" bind:clientWidth={width} bind:clientHeight={height}>
    <svg {width} {height}>
      {#if polygon_data && geo_data}
        <Map
          {polygon_data}
          {geo_data}
          {disputed_data}
          {pathGenerator}
          {width}
          {map_shrink}
        />
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
            on:barClick={handleBarClick}
          />
        {:else if elections_check}
          <Elections
            {elections}
            {colorScale}
            {indy_locs}
            on:barClick={handleBarClick}
          />
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
            on:barClick={handleBarClick}
          />
        {:else}
          <Lolly
            {aggregatedLocations}
            {current_mean}
            {colorScale}
            {indy_locs}
            on:barClick={handleBarClick}
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
    text-align: center;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .button.active,
  button.active {
    background-color: #000000;
    color: white;
    font-weight: 500;
  }

  .guns_button {
    background-color: #d4d4d4;
    position: absolute;
    top: 40px;
    left: 5px;
    padding: 6px 12px;
    font-family: "Montserrat";
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
    border: none;
  }

  .politics_button {
    background-color: #d4d4d4;
    border: none;
    position: absolute;
    font-family: "Montserrat";
    top: 75px;
    left: 5px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .elections_button {
    background-color: #d4d4d4;
    border: none;
    position: absolute;
    font-family: "Montserrat";
    top: 110px;
    left: 5px;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .button {
    background-color: #d4d4d4;
    position: absolute;
    font-family: "Montserrat";
    top: 5px;
    left: 5px;
    border: none;
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: 500;
  }

  .button:hover {
    background-color: #e0e0e0;
    color: black;
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

  button {
    font-family: "Montserrat";
    font-weight: 500;
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
    background-color: black;
    color: white;
    border: 2px solid #000;
    border-radius: 4px;
    font-size: 20px;
    padding: 5px 8px;
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

  .environment_buttons {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    z-index: 100;
  }

  .environment_buttons button {
    display: inline-block;
    width: auto;
    min-width: 0;
    padding: 6px 10px;
    font-family: "Montserrat";
    font-size: 14px;
    background-color: #d4d4d4;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition:
      background 0.2s,
      box-shadow 0.2s;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .environment_buttons button:hover {
    background-color: #ddd;
  }

  .environment_buttons button.selected {
    background-color: #000000;
    color: white;
  }

  .env_burger-menu {
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 3px;
  }

  .env_burger-icon {
    background-color: black;
    color: white;
    border: 2px solid #000;
    border-radius: 4px;
    font-size: 20px;
    padding: 5px 8px;
    cursor: pointer;
    font-family: "Montserrat";
  }

  .env_burger-dropdown {
    position: absolute;
    right: 0;
    top: 40px;
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .env_burger-dropdown button {
    margin: 4px 0;
    background-color: #f2f2f2;
    border: none;
    padding: 6px 8px;
    text-align: right;
    border-radius: 3px;
    font-family: "Montserrat";
    font-size: 14px;
    cursor: pointer;
  }

  .env_burger-dropdown button:hover {
    background-color: #f2f2f2;
  }
</style>
