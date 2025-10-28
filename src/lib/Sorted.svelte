<script>
    import * as d3 from "d3";
    export let aggregatedLocations,
        test,
        colorScale,
        height,
        width,
        current_mean,
        heightScale,
        spike,
        bars,
        elections_check,
        elections,
        angledSpike;

    let sorted_width;
    const lineHeight = 70; // Height of the vertical line

    // Adjusted getCircleY
    function getCircleY(score) {
        if (current_mean === "Sec_Gunshots_Now_N" || elections_check) {
            // Score in 1-3 → map to 0-lineHeight
            return lineHeight - ((score - 1) / 2) * lineHeight;
        } else {
            // Score in 1-5 → map to 0-lineHeight
            return lineHeight - ((score - 1) / 4) * lineHeight;
        }
    }

    let idpData, otherData, maxCount, scale;

    $: if (test) {
        // 1️⃣ Get all unique ADM2 names from test
        const allLocations = Array.from(new Set(test.map((d) => d.adm2)));

        // 2️⃣ Separate existing IDP and Other data
        const idpExisting = test.filter((d) => d.poc === "IDP");
        const otherExisting = test.filter((d) => d.poc === "Other");

        // 3️⃣ Create lookup maps for quick access
        const idpMap = new Map(idpExisting.map((d) => [d.adm2, d]));
        const otherMap = new Map(otherExisting.map((d) => [d.adm2, d]));

        // 4️⃣ Make sure all ADM2 are represented in both
        idpData = allLocations.map((adm2) => {
            const d = idpMap.get(adm2);
            if (d) return d;
            // create a placeholder with zero counts
            const otherRef = otherMap.get(adm2);
            return {
                adm2,
                poc: "IDP",
                env: otherRef?.env ?? "",
                x: otherRef?.x ?? 0,
                y: otherRef?.y ?? 0,
                meanScore: 0,
                filteredVisionCounts: [
                    {
                        Party_Vision:
                            "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                        count: 0,
                    },
                    {
                        Party_Vision:
                            "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                        count: 0,
                    },
                    { Party_Vision: "None of the parties", count: 0 },
                    {
                        Party_Vision: "South Sudan Opposition Alliance (SSOA)",
                        count: 0,
                    },
                ],
            };
        });

        otherData = allLocations.map((adm2) => {
            const d = otherMap.get(adm2);
            if (d) return d;
            const idpRef = idpMap.get(adm2);
            return {
                adm2,
                poc: "Other",
                env: idpRef?.env ?? "",
                x: idpRef?.x ?? 0,
                y: idpRef?.y ?? 0,
                meanScore: 0,
                filteredVisionCounts: [
                    {
                        Party_Vision:
                            "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                        count: 0,
                    },
                    {
                        Party_Vision:
                            "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                        count: 0,
                    },
                    { Party_Vision: "None of the parties", count: 0 },
                    {
                        Party_Vision: "Other parties",
                        count: 0,
                    },
                ],
            };
        });

        // 5️⃣ Scaling
        maxCount = d3.max(
            test.flatMap((d) => d.filteredVisionCounts.map((p) => p.count)),
        );
        scale = d3.scaleLinear().domain([0, maxCount]).range([2, 40]);
    }

    // Layout constants
    const partySpacing = 13;
    const adm2Spacing = 12;
    const centerX = 50; // central axis position

    // all possible options
    const partyOptions = [
        "Sudan People’s Liberation Movement In Government (SPLM-IG)",
        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
        "None of the parties",
        "Other parties",
    ];
    const shortLabels = {
        "Sudan People’s Liberation Movement In Government (SPLM-IG)":
            "government",
        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)":
            "opposition",
        "None of the parties": "none",
        "Other parties": "other",
    };

    let currentIndex = 1; // starting from SPLM-IO
    let targetParty = partyOptions[currentIndex];

    function switchParty() {
        currentIndex = (currentIndex + 1) % partyOptions.length;
        targetParty = partyOptions[currentIndex];
    }

    let xScale;
    // x-scale to position bars evenly
    $: if (aggregatedLocations && sorted_width) {
        xScale = d3
            .scaleBand()
            .domain(aggregatedLocations.map((d, i) => i))
            .range([0, sorted_width])
            .padding(0.2);
    }
</script>

<div class="sorted" bind:clientWidth={sorted_width}>
    {#if bars}
        <button class="switch_button" on:click={switchParty}> switch </button>
        <p>
            Party: <strong>{shortLabels[targetParty]}</strong>
        </p>
    {/if}
    <svg width={sorted_width} {height}>
        {#if bars}
            <!-- IDP -->
            {#each idpData as d, i}
                {#each d.filteredVisionCounts.filter((p) => p.Party_Vision === targetParty) as p}
                    <rect
                        x={centerX - scale(p.count)}
                        y={i * adm2Spacing + 10}
                        width={scale(p.count)}
                        height={10}
                        fill="gray"
                    />
                {/each}
            {/each}
            <!-- Other -->
            {#each otherData as d, i}
                {#each d.filteredVisionCounts.filter((p) => p.Party_Vision === targetParty) as p}
                    <rect
                        x={centerX + 5}
                        y={i * adm2Spacing + 10}
                        width={scale(p.count)}
                        height={10}
                        fill="black"
                    />
                    <text
                        x={centerX + scale(p.count) + 15}
                        y={i * adm2Spacing + 18}
                        font-family="Montserrat"
                        font-size="10px"
                        font-weight="600">{d.adm2}</text
                    >
                {/each}
            {/each}
        {:else if elections_check}
            <!-- Elections -->
            <line
                x1="10"
                y1={140 + lineHeight / 2}
                x2="470"
                y2={140 + lineHeight / 2}
                stroke="black"
                stroke-width="1"
                stroke-opacity="0.8"
                stroke-dasharray="8 5"
            />
            {#each elections as d, i}
                {#if d.x && d.y && d.meanScore != null}
                    <g transform={`translate(${(i + 2) * 15}, 140)`}>
                        <!-- <rect
                            x="-0.5"
                            y="-8"
                            width="7"
                            height="7"
                            fill={colorScale(d.poc)}
                            opacity="1"
                            stroke="black"
                            stroke-width="0.5"
                        /> -->

                        <rect
                            x="-6.5"
                            y="0"
                            width="9"
                            height={lineHeight}
                            fill="#cccccc"
                            opacity="1"
                        />
                        <!-- Filled portion -->
                        <rect
                            x="-5"
                            y={getCircleY(d.meanScore)}
                            width="6"
                            height={lineHeight - getCircleY(d.meanScore)}
                            fill={colorScale(d.poc)}
                            fill-opacity="1"
                        />

                        <g transform="rotate(-45, 0, 0)">
                            <rect
                                x={0}
                                y="-15"
                                width={d.adm2.length * 6 + 8}
                                height="12"
                                fill="white"
                                rx="2"
                                opacity="0.8"
                            />
                            <text
                                x={3}
                                y="-5"
                                font-family="Montserrat"
                                font-weight="600"
                                font-size="10px"
                                fill="black"
                            >
                                {d.adm2}
                            </text>
                        </g>

                        <!-- Score indicator circle -->
                        <!-- <circle
                            cx="1"
                            cy={getCircleY(d.meanScore)}
                            r="3"
                            fill={colorScale(d.poc)}
                            stroke="black"
                            stroke-width="1"
                        >
                            <title>
                                Score: {d.meanScore.toFixed(2)}
                            </title>
                        </circle> -->
                        <line
                            x1="-10"
                            y1={lineHeight}
                            x2="10"
                            y2={lineHeight}
                            stroke="gray"
                            stroke-width="1"
                        />
                    </g>
                {/if}
            {/each}
        {:else}
            <line
                x1="10"
                y1={140 + lineHeight / 2}
                x2="470"
                y2={140 + lineHeight / 2}
                stroke="black"
                stroke-width="1"
                stroke-opacity="0.8"
                stroke-dasharray="8 5"
            />
            {#if xScale}
                {#each aggregatedLocations as d, i}
                    <g
                        transform={`translate(${xScale(i) + xScale.bandwidth() / 2}, 140)`}
                    >
                        <!-- Background bar -->
                        <rect
                            x="-6.5"
                            y="0"
                            width="9"
                            height={lineHeight}
                            fill="#cccccc"
                            opacity="1"
                        />
                        <!-- Filled portion -->
                        <rect
                            x="-5"
                            y={getCircleY(d.meanScore)}
                            width="6"
                            height={lineHeight - getCircleY(d.meanScore)}
                            fill={colorScale(d.poc)}
                            fill-opacity="1"
                        />

                        <!-- Rotated label group -->
                        <g transform="rotate(-45, 0, 0)">
                            <rect
                                x={0}
                                y="-15"
                                width={d.adm2.length * 6 + 8}
                                height="12"
                                fill="white"
                                rx="2"
                                opacity="0.8"
                            />
                            <text
                                x={3}
                                y="-5"
                                font-family="Montserrat"
                                font-weight="600"
                                font-size="10px"
                                fill="black"
                            >
                                {d.adm2}
                            </text>
                        </g>

                        <!-- baseline line -->
                        <line
                            x1="-10"
                            y1={lineHeight}
                            x2="10"
                            y2={lineHeight}
                            stroke="gray"
                            stroke-width="1"
                        />
                    </g>
                {/each}
            {/if}
        {/if}
    </svg>
</div>

<style>
    .sorted {
        width: 33%;
        height: 220px;
        position: absolute;
        bottom: 0px;
        left: 5px;
    }

    /* On small screens, take full width */
    @media (max-width: 1200px) {
        .sorted {
            width: 35%;
        }
    }

    @media (max-width: 1000px) {
        .sorted {
            width: 40%;
        }
    }

    @media (max-width: 900px) {
        .sorted {
            width: 45%;
        }
    }

    @media (max-width: 768px) {
        .sorted {
            width: 50%;
            left: 0;
            bottom: 0;
        }
    }

    @media (max-width: 650px) {
        .sorted {
            width: 70%;
            left: 0;
            bottom: 0;
        }
    }

    @media (max-width: 480px) {
        .sorted {
            width: 100%;
            left: 0;
            bottom: 0;
        }
    }

    .switch_button {
        position: absolute;
        top: 5px;
        left: 160px;
        z-index: 10;
        background-color: white;
        border: 1px solid black;
        border-radius: 4px;
        padding: 4px 8px;
        font-family: "Montserrat", sans-serif;
        font-size: 12px;
        cursor: pointer;
    }

    p {
        position: absolute;
        top: 35px;
        left: 160px;
        font-family: "Montserrat", sans-serif;
        font-size: 14px;
        margin: 0;
    }
</style>
