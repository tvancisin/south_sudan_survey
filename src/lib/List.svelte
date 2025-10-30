<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let aggregatedLocations, current_location, default_survey_data;

    let list_width,
        filtered_location,
        location_groups,
        safety,
        gunshots,
        elections,
        partyVision;
    const electionsMap = {
        Soon: 3,
        Delayed: 2,
        Never: 1,
    };
    let current_mean = "overall_sec_mean_score";
    const pocOrder = ["POC", "IDP", "Other"];

    // Example color scale
    const colorScale = d3
        .scaleOrdinal()
        .domain(["POC", "IDP", "Other"])
        .range(["white", "#808080", "black"]);

    function handleClose(value) {
        dispatch("barClick", { value });
    }

    $: if (default_survey_data) {
        filtered_location = default_survey_data.filter(
            (d) => d.ADM2 == current_location,
        );
        // console.log(filtered_location);
        location_groups = d3
            .groups(filtered_location, (d) => d.poc)
            .map(([adm2, pocGroups]) => [
                adm2,
                pocGroups.sort(
                    (a, b) => pocOrder.indexOf(a[0]) - pocOrder.indexOf(b[0]),
                ),
            ]);

        safety = location_groups.map(([group, items]) => {
            // Extract valid numeric values
            const scores = items
                .map((d) => parseFloat(d.overall_sec_mean_score))
                .filter((v) => !isNaN(v));

            // Compute mean
            const mean =
                scores.length > 0
                    ? scores.reduce((sum, v) => sum + v, 0) / scores.length
                    : null;

            return { group, mean };
        });

        // --- GUNSHOTS MEAN ---
        gunshots = location_groups.map(([group, items]) => {
            const scores = items
                .map((d) => parseFloat(d.Sec_Gunshots_Now_N))
                .filter((v) => !isNaN(v));

            const mean =
                scores.length > 0
                    ? scores.reduce((sum, v) => sum + v, 0) / scores.length
                    : null;

            return { group, mean };
        });

        // --- ELECTIONS MEAN ---
        elections = location_groups.map(([group, items]) => {
            const scores = items
                .map((d) => electionsMap[d.elections_held_category])
                .filter((v) => v !== undefined);

            const mean =
                scores.length > 0
                    ? scores.reduce((sum, v) => sum + v, 0) / scores.length
                    : null;

            return { group, mean };
        });

        const mainParties = [
            "Sudan People’s Liberation Movement In Government (SPLM-IG)",
            "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
            "None of the parties",
        ];

        partyVision = location_groups.map(([group, items]) => {
            // Count occurrences of Party_Vision
            const visionCounts = d3.rollup(
                items.filter(
                    (d) => d.Party_Vision && d.Party_Vision.trim() !== "",
                ),
                (arr) => arr.length,
                (d) => d.Party_Vision,
            );

            // Convert Map → array
            const sortedVisionCounts = Array.from(
                visionCounts,
                ([Party_Vision, count]) => ({
                    Party_Vision,
                    count,
                }),
            ).sort((a, b) => d3.descending(a.count, b.count));

            // Separate main parties
            const main = sortedVisionCounts.filter((d) =>
                mainParties.includes(d.Party_Vision),
            );

            // Sum all others as "Other parties"
            const otherSum = d3.sum(
                sortedVisionCounts
                    .filter((d) => !mainParties.includes(d.Party_Vision))
                    .map((d) => d.count),
            );

            const filteredVisionCounts = [
                ...main,
                { Party_Vision: "Other parties", count: otherSum },
            ];

            // Enforce consistent order
            const partyOrder = [...mainParties, "Other parties"];
            filteredVisionCounts.sort(
                (a, b) =>
                    partyOrder.indexOf(a.Party_Vision) -
                    partyOrder.indexOf(b.Party_Vision),
            );

            return {
                group,
                filteredVisionCounts,
            };
        });
    }
    const shortNames = {
        "Sudan People’s Liberation Movement In Government (SPLM-IG)":
            "Government",
        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)":
            "Opposition",
        "None of the parties": "None",
        "Other parties": "Other",
    };

    // Filter only the "Other" group
    $: otherGroup = partyVision.find((d) => d.group === "Other");
    $: idpGroup = partyVision.find((d) => d.group === "IDP");

    $: data = otherGroup
        ? otherGroup.filteredVisionCounts.map((d) => ({
              ...d,
              short: shortNames[d.Party_Vision] || d.Party_Vision,
          }))
        : [];

    $: idpData = idpGroup
        ? idpGroup.filteredVisionCounts.map((d) => ({
              ...d,
              short: shortNames[d.Party_Vision] || d.Party_Vision,
          }))
        : [];

    // Dimensions
    const margin = { top: 10, right: 10, bottom: 30, left: 30 };
    $: width = list_width - 20;
    const height = 100 - margin.top - margin.bottom;
    // Scales
    $: xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.Party_Vision))
        .range([0, width])
        .padding(0.2);

    $: yScale = d3.scaleLinear().domain([0, 1500]).range([height, 0]);
</script>

<div class="list" bind:clientWidth={list_width}>
    <h1>{current_location}</h1>
    <button class="close_btn" on:click={handleClose}>X</button>

    <div class="chart-section">
        <h2>Safety</h2>
        {#each safety as s, i}
            <div class="chart-group">
                <svg width={list_width - 20} height="40">
                    <line
                        x1="0"
                        y1="20"
                        x2={list_width - 20}
                        y2="20"
                        stroke="#ccc"
                        stroke-width="2"
                    />

                    {#if i === safety.length - 1}
                        <text
                            x="0"
                            y="38"
                            font-family="Montserrat"
                            font-size="12"
                            font-weight="600"
                            fill="#000"
                        >
                            Unsafe
                        </text>
                        <text
                            x={list_width - 20}
                            y="38"
                            font-family="Montserrat"
                            font-size="12"
                            font-weight="600"
                            text-anchor="end"
                            fill="#000"
                        >
                            Safe
                        </text>
                    {/if}

                    {#if s.mean !== null}
                        <circle
                            cx={((s.mean - 1) / 4) * (list_width - 20)}
                            cy="20"
                            r="6"
                            fill={colorScale(s.group)}
                            stroke="black"
                        />
                        <text
                            x={((s.mean - 1) / 4) * (list_width - 20)}
                            y="10"
                            font-family="Montserrat"
                            font-size="12"
                            text-anchor="middle"
                            fill="#000"
                        >
                            {s.mean.toFixed(2)}
                        </text>
                    {/if}
                </svg>
            </div>
        {/each}
    </div>

    <div class="chart-section">
        <h2>Elections</h2>
        {#each elections as e, i}
            {#if e.group !== "POC"}
                <div class="chart-group">
                    <svg width={list_width - 20} height="40">
                        <line
                            x1="0"
                            y1="20"
                            x2={list_width - 20}
                            y2="20"
                            stroke="#ccc"
                            stroke-width="2"
                        />

                        {#if i === elections.filter((e) => e.group !== "POC").length - 1}
                            <text
                                x="0"
                                y="38"
                                font-family="Montserrat"
                                font-size="12"
                                font-weight="600"
                                fill="#000"
                            >
                                Never
                            </text>
                            <text
                                x={list_width - 20}
                                y="38"
                                font-family="Montserrat"
                                font-size="12"
                                font-weight="600"
                                text-anchor="end"
                                fill="#000"
                            >
                                Soon
                            </text>
                        {/if}

                        {#if e.mean !== null}
                            <circle
                                cx={((e.mean - 1) / 2) * (list_width - 20)}
                                cy="20"
                                r="6"
                                fill={colorScale(e.group)}
                                stroke="black"
                            />
                            <text
                                x={((e.mean - 1) / 2) * (list_width - 20)}
                                y="10"
                                font-family="Montserrat"
                                font-size="12"
                                text-anchor="middle"
                                fill="#000"
                            >
                                {e.mean.toFixed(2)}
                            </text>
                        {/if}
                    </svg>
                </div>
            {/if}
        {/each}
    </div>

    <div class="chart-section">
        <h2>Gunshots</h2>
        {#each gunshots as g, i}
            <div class="chart-group">
                <svg width={list_width - 20} height="40">
                    <line
                        x1="0"
                        y1="20"
                        x2={list_width - 20}
                        y2="20"
                        stroke="#ccc"
                        stroke-width="2"
                    />

                    {#if i === gunshots.length - 1}
                        <text
                            x="0"
                            y="38"
                            font-family="Montserrat"
                            font-size="12"
                            font-weight="600"
                            fill="#000"
                        >
                            Never
                        </text>
                        <text
                            x={list_width - 20}
                            y="38"
                            font-family="Montserrat"
                            font-size="12"
                            font-weight="600"
                            text-anchor="end"
                            fill="#000"
                        >
                            Many times
                        </text>
                    {/if}

                    {#if g.mean !== null}
                        <circle
                            cx={3 + ((g.mean - 1) / 2) * (list_width - 20)}
                            cy="20"
                            r="6"
                            fill={colorScale(g.group)}
                            stroke="black"
                        />
                        <text
                            x={((g.mean - 1) / 2) * (list_width - 20)}
                            y="10"
                            font-family="Montserrat"
                            font-size="12"
                            text-anchor="middle"
                            fill="#000"
                        >
                            {g.mean.toFixed(2)}
                        </text>
                    {/if}
                </svg>
            </div>
        {/each}
    </div>

    <div class="chart-section">
        <h2>Political Preferences</h2>
        <svg width={list_width - 20} height="150">
            <g transform={`translate(0, ${margin.top * 2})`}>
                <!-- OTHER group: bars going up -->
                {#each data as d}
                    <rect
                        x={xScale(d.Party_Vision)}
                        y={yScale(d.count)}
                        width={xScale.bandwidth()}
                        height={height - yScale(d.count)}
                        fill="black"
                    />
                    <text
                        x={xScale(d.Party_Vision)}
                        y={yScale(d.count) - 2}
                        fill="black"
                        font-size="12"
                        font-family="Montserrat"
                        transform={`rotate(-20, ${xScale(d.Party_Vision)}, ${yScale(d.count) - 2})`}
                    >
                        {d.short}
                    </text>
                {/each}

                <!-- IDP group: bars going down -->
                {#each idpData as d}
                    <rect
                        x={xScale(d.Party_Vision)}
                        y={height + 3}
                        width={xScale.bandwidth()}
                        height={height - yScale(d.count)}
                        fill="#808080"
                    />
                {/each}
            </g>
        </svg>
    </div>
</div>

<style>
    h1 {
        font-family: Montserrat;
        font-size: 1.5em;
        font-weight: 600;
        margin-bottom: 5px;
        margin-top: 0px;
        padding-bottom: 5px;
        text-align: center;
    }

    .close_btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: black;
        color: white;
        font-family: "Montserrat";
        cursor: pointer;
        font-weight: 900;
        border-radius: 2px;
        font-size: 20px;
    }
    .list {
        z-index: 999;
        position: absolute;
        right: 0;
        width: 30%;
        height: 100vh;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
    }

    @media (max-width: 768px) {
        .list {
            width: 100%;
        }
    }

    .list::after {
        content: "";
        display: block;
        height: 10px; /* Extra space at the bottom */
    }
    .chart-section {
        margin-bottom: 10px;
        background-color: rgb(241, 241, 241);
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .chart-section h2 {
        font-family: "Montserrat";
        font-weight: 600;
        margin: 0px;
        font-size: 16px;
    }
</style>
