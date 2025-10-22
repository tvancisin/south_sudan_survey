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

  let width,
    height,
    survey_data,
    default_survey_data,
    geo_data,
    indy_locs,
    projected_locations,
    polygon_data = [],
    aggregatedLocations,
    wavePeriods,
    timeScale,
    location_groups,
    axisGroup,
    isListVisible = false,
    csv_path = ["./data/survey.csv"],
    geojson_path = [
      "./data/unique_prio_grids.json",
      "./data/country_polygons.json",
    ],
    margin = { top: 30, bottom: 30, left: 30, right: 30 };

  // Bound values for dropdowns
  let selectedEnv = "all";
  let selectedTopic = "";

  // init
  onMount(async () => {
    // load CSV
    const csv = await getCSV(csv_path);
    survey_data = csv[0];
    default_survey_data = csv[0];

    // prepare data for timeline with gantt
    let timeline = d3.groups(survey_data, (d) => d.Wave);
    wavePeriods = timeline.map(([waveName, items]) => {
      const first = items[0];
      const year = +first.wave_year;
      const startMonth = monthMap[first.wave_month_start];
      const endMonth = monthMap[first.wave_month_end];

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth + 1, 0); // last day of end month

      return {
        wave: waveName,
        start: startDate,
        end: endDate,
      };
    });

    // load GeoJSON
    const geo = await getGeo(geojson_path);
    geo_data = geo[0].features;
    polygon_data = geo[1].features;
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
        const spacing = 9; // pixel spacing
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

    // individual locations for labels
    projected_locations = survey_data.map((d) => {
      const coords = projection([+d.central_longitude, +d.central_latitude]);
      return { ...d, x: coords?.[0], y: coords?.[1] };
    });

    indy_locs = d3.groups(projected_locations, (d) => d.ADM2);
  }

  // projection
  $: projection = d3
    .geoMercator()
    .center([30, 7.5]) // center on ssudan
    .scale(width * 3.3)
    .translate([width / 2, height / 2]);

  // draw geojson polygons
  $: pathGenerator = d3.geoPath().projection(projection);

  // Height of spike
  // let heightScale = d3
  //   .scaleThreshold()
  //   .domain([5 / 3, 10 / 3]) // thresholds dividing domain [0,5] into three parts
  //   .range([120, 60, 10]); // output heights for each range

  let heightScale = d3
    .scaleLinear()
    .domain([1, 5]) // linear scale from 0 to 5
    .range([120, 2]); // heights from 120px (low values) to 10px (high values)

  // Color scale (optional)
  const colorScale = d3
    .scaleOrdinal()
    .domain(["POC", "IDP", "Other"]) // list all possible values
    .range(["white", "gray", "black"]); // or any colors you like

  function handleEnvClick(which) {
    // heightScale.domain([5 / 3, 10 / 3]).range([120, 60, 10]);

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
    heightScale.domain([1, 5]).range([120, 2]);
    let filtered_data = default_survey_data;
    if (which == "road") {
      current_mean = "Sec_Roads_Now_N";
    } else if (which == "countryside") {
      current_mean = "Sec_Countryside_Now_N";
    } else if (which == "neighbour") {
      current_mean = "Sec_Nbr_Now_N";
    } else if (which == "buy") {
      current_mean = "Sec_Buy_Now_N";
    } else if (which == "culture") {
      current_mean = "Sec_Cul_Now_N";
    } else if (which == "overall") {
      current_mean = "overall_sec_mean_score";
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
    survey_data = default_survey_data;
    // heightScale.domain([4 / 3, 8 / 3]).range([10, 60, 120]);

    heightScale.domain([1, 3]).range([2, 80]);
    current_mean = "Sec_Gunshots_Now_N";
  }

  let test;
  function handlePoliticsClick() {
    current_mean = "test";
    test = location_groups.flatMap(([adm2, pocGroups]) => {
      const n = pocGroups.length; // number of subgroups (POC, IDP, Other)

      return pocGroups.map(([poc, items], i) => {
        const overall_scores = items
          .map((d) => +d[current_mean])
          .filter((v) => v && !isNaN(v));

        const meanScore = d3.mean(overall_scores);
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

        // Define the four parties you care about (in desired order)
        const partyOrder = [
          "Sudan People’s Liberation Movement In Government (SPLM-IG)",
          "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
          "None of the parties",
          "South Sudan Opposition Alliance (SSOA)",
        ];
        const targetParties = new Set(partyOrder);

        // Filter to include only those parties
        const filteredVisionCounts = sortedVisionCounts
          .filter((d) => targetParties.has(d.Party_Vision))
          // Sort according to the defined order
          .sort(
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
          meanScore,
          filteredVisionCounts,
        };
      });
    });
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

  <div class="dropdown">
    <div class="button">{"Safety"}</div>
    <div class="menu">
      {#each topics as t}
        <button
          style="font-family: 'Montserrat';"
          on:click={() => handleSelect(t.value)}>{t.label}</button
        >
      {/each}
    </div>
  </div>

  <!-- <div class="topics_buttons">
    <select
      id="topicSelect"
      bind:value={selectedTopic}
      on:change={() => handleTopicClick(selectedTopic)}
    >
      <option value="" disabled>Safety</option>
      <option value="road">Roads</option>
      <option value="countryside">Countryside</option>
      <option value="buy">Shopping</option>
      <option value="neighbour">Neighbour</option>
      <option value="culture">Cultural Events</option>
    </select>
  </div> -->

  <button class="guns_button" on:click={handleGunsClick}>Gunshots</button>
  <button class="politics_button" on:click={handlePoliticsClick}
    >Politics</button
  >
  <!-- <button class="list_button" on:click={() => (isListVisible = !isListVisible)}>
    {isListVisible ? "Hide List" : "Show List"}
  </button> -->
  <!-- <List {aggregatedLocations} /> -->

  <div class="map" bind:clientWidth={width} bind:clientHeight={height}>
    <svg {width} {height}>
      {#if polygon_data && geo_data}
        <Map {polygon_data} {geo_data} {pathGenerator} />
      {/if}

      {#if width && height && aggregatedLocations}
        <!-- <Legend {heightScale} {margin} {height} {spike} /> -->
        {#if current_mean == "Sec_Gunshots_Now_N"}
          <Spikes
            {aggregatedLocations}
            {heightScale}
            {colorScale}
            {spike}
            {angledSpike}
            {indy_locs}
          />
        {:else if current_mean == "test"}
          <Bars {test} {indy_locs} />
        {:else}
          <Lolly
            {aggregatedLocations}
            {heightScale}
            {colorScale}
            {spike}
            {angledSpike}
            {indy_locs}
          />
        {/if}
      {/if}

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
    </svg>
    <Sorted
      {aggregatedLocations}
      {colorScale}
      {height}
      {width}
      {current_mean}
      {heightScale}
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
  .guns_button {
    width: 90px;
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
    width: 90px;
    position: absolute;
    font-family: "Montserrat";
    top: 85px;
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

  .dropdown {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 90px;
  }

  .button {
    font-family: "Montserrat";
    padding: 6px 12px;
    font-size: 14px;
    border-radius: 3px;
    cursor: pointer;
    background-color: #f0f0f0;
    border: 2px solid #000000;
    text-align: center;
  }

  .button:hover {
    background-color: #e0e0e0;
  }

  .menu {
    display: none;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-top: 0px;
    position: absolute;
    width: 100px;
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
</style>
