<script>
  import { onMount } from "svelte";
  import { getCSV, getGeo, monthMap, spike, angledSpike } from "./utils";
  import * as d3 from "d3";
  import List from "./lib/List.svelte";
  import Map from "./lib/Map.svelte";
  import Legend from "./lib/Legend.svelte";
  import Spikes from "./lib/Spikes.svelte";
  import Time from "./lib/Time.svelte";

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
        const spacing = 9; // pixel spacing between spikes
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
    aggregatedLocations.sort((a, b) => a.meanScore - b.meanScore);

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
    .scale(width * 4)
    .translate([width / 2, height / 2]);

  // draw geojson polygons
  $: pathGenerator = d3.geoPath().projection(projection);

  // Height of spike
  const heightScale = d3
    .scaleThreshold()
    .domain([5 / 3, 10 / 3]) // thresholds dividing domain [0,5] into three parts
    .range([120, 60, 10]); // output heights for each range

  // Color scale (optional)
  const colorScale = d3
    .scaleOrdinal()
    .domain(["POC", "IDP", "Other"]) // list all possible values
    .range(["white", "gray", "black"]); // or any colors you like

  function handleEnvClick(which) {
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
    }
    survey_data = filtered_data;
  }

  function listButtonHandle() {
    d3.select("main").attr("width", "80%");
    const listDiv = document.querySelector(".list");
    if (listDiv.style.right === "0px") {
      listDiv.style.right = "-100%";
    } else {
      listDiv.style.right = "0px";
    }
  }

  function handleWaveClick(wave) {
    const wav = wave.detail.wave;
    let filtered_data = default_survey_data.filter((d) => d.Wave == wav);
    survey_data = filtered_data;
  }
</script>

<main>
  <div class="environment_buttons">
    <button on:click={() => handleEnvClick("poc_idp")}>POC+IDP</button>
    <button on:click={() => handleEnvClick("poc")}>POC</button>
    <button on:click={() => handleEnvClick("idp")}>IDP</button>
    <button on:click={() => handleEnvClick("oth")}>Other</button>
    <button on:click={() => handleEnvClick("all")}>All</button>
  </div>

  <div class="topics_buttons">
    <button on:click={() => handleTopicClick("road")}>Roads</button>
    <button on:click={() => handleTopicClick("countryside")}>Countryside</button
    >
    <button on:click={() => handleTopicClick("buy")}>Shopping</button>
    <button on:click={() => handleTopicClick("neighbour")}>Neighbour</button>
    <button on:click={() => handleTopicClick("culture")}>Cultural Events</button
    >
  </div>
  <!-- <button class="list_button" on:click={() => (isListVisible = !isListVisible)}>
    {isListVisible ? "Hide List" : "Show List"}
  </button> -->
  <List {aggregatedLocations}  />

  <div class="map" bind:clientWidth={width} bind:clientHeight={height}>
    <svg {width} {height}>
      {#if polygon_data && geo_data}
        <Map {polygon_data} {geo_data} {pathGenerator} />
      {/if}

      {#if width && height && aggregatedLocations}
        <Legend {heightScale} {margin} {height} {spike} />
        <Spikes
          {aggregatedLocations}
          {heightScale}
          {colorScale}
          {spike}
          {angledSpike}
          {indy_locs}
        />
      {/if}

      {#if wavePeriods}
        <Time
          {wavePeriods}
          {timeScale}
          {height}
          {width}
          {margin}
          {axisGroup}
          on:waveClick={handleWaveClick}
        />
      {/if}
    </svg>
  </div>
</main>

<style>
  main {
    position: absolute;
    width: 100%;
    height: 100vh;
  }
  .map {
    width: 70%;
    height: 100%;
  }
  button {
    cursor: pointer;
    width: 110px;
  }
  .environment_buttons {
    position: absolute;
    top: 5px;
    left: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .topics_buttons {
    position: absolute;
    top: 150px;
    left: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .list_button {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 10;
  }
</style>
