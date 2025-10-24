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
        angledSpike;

    const lineHeight = 70; // Height of the vertical line

    // Function to map score (1-5) to vertical position (0-lineHeight)
    function getCircleY(score) {
        return lineHeight - ((score - 1) / 4) * lineHeight; // Inverted scale so higher scores are at the top
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
                        Party_Vision: "South Sudan Opposition Alliance (SSOA)",
                        count: 0,
                    },
                ],
            };
        });

        // 5️⃣ Scaling
        maxCount = d3.max(
            test.flatMap((d) => d.filteredVisionCounts.map((p) => p.count)),
        );
        scale = d3.scaleLinear().domain([0, maxCount]).range([0, 100]);
    }

    // Layout constants
    const partySpacing = 13;
    const adm2Spacing = 12;
    const centerX = 120; // central axis position
    const targetParty =
        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)";
</script>

<div class="sorted">
    <svg width={width/2} {height}>
        {#if current_mean == "Sec_Gunshots_Now_N"}
            {#each aggregatedLocations as d, i}
                <g transform={`translate(${(i + 2) * 15}, 210)`}>
                    <path
                        d={spike(heightScale(d.meanScore))}
                        transform={`translate(0, 0)`}
                        fill={colorScale(d.poc)}
                        fill-opacity="1"
                        stroke="black"
                        stroke-width="0.5"
                    >
                        <title>
                            mean: {d.meanScore}
                        </title>
                    </path>
                    <g
                        transform={`translate(0, ${-heightScale(d.meanScore) - 4}) rotate(-45)`}
                    >
                        <text
                            text-anchor="start"
                            font-family="Montserrat"
                            font-weight="600"
                            font-size="10px"
                        >
                            {d.adm2}
                        </text>
                    </g>
                </g>
            {/each}
        {:else if current_mean == "test"}
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
        {:else}
            <line
                x1="10"
                y1={140 + lineHeight / 2}
                x2="470"
                y2={140 + lineHeight / 2}
                stroke="black"
                stroke-width="1"
                stroke-opacity="0.8"
                stroke-dasharray="10 5"
            />
            {#each aggregatedLocations as d, i}
                <g transform={`translate(${(i + 2) * 15}, 140)`}>
                    <!-- Background bar -->
                    <rect
                        x="-3"
                        y="0"
                        width="4"
                        height={lineHeight}
                        fill="#a6a6a6"
                        opacity="0.8"
                    />
                    <text
                        x="0"
                        y="-4"
                        transform="rotate(-45)"
                        font-family="Montserrat"
                        font-weight="600"
                        font-size="10px">{d.adm2}</text
                    >

                    <!-- Filled portion -->
                    <rect
                        x="-3"
                        y={getCircleY(d.meanScore)}
                        width="4"
                        height={lineHeight - getCircleY(d.meanScore)}
                        fill="black"
                    />
                    <!-- Score indicator circle -->
                    <circle
                        cx="-0.5"
                        cy={getCircleY(d.meanScore)}
                        r="5"
                        fill={colorScale(d.poc)}
                        stroke="black"
                        stroke-width="1"
                    >
                        <title>
                            Score: {d.meanScore.toFixed(2)}
                        </title>
                    </circle>
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
    </svg>
</div>

<style>
    .sorted {
        width: 50%;
        height: 220px;
        position: absolute;
        bottom: 5px;
        left: 5px;
    }
</style>
