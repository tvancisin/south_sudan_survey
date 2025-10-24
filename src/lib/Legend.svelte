<script>
    import * as d3 from "d3";
    export let heightScale, margin, height, width, current_mean, spike;

    const spikeLabels = [
        "Very Unsafe",
        "Neither Safe, Nor Unsafe",
        "Very Safe",
    ];
    $: bars = [
        {
            adm2: "Malakal",
            poc: "Other",
            env: "Urban",
            x: width - 40,
            y: 220,
            filteredVisionCounts: [
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                    count: 954,
                },
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                    count: 344,
                },
                {
                    Party_Vision: "None of the parties",
                    count: 82,
                },
                {
                    Party_Vision: "Other parties",
                    count: 778,
                },
            ],
        },
        {
            adm2: "Malakal",
            poc: "IDP",
            env: "IDP Camp",
            x: width - 50,
            y: 220,
            filteredVisionCounts: [
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                    count: 428,
                },
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                    count: 526,
                },
                {
                    Party_Vision: "None of the parties",
                    count: 58,
                },
                {
                    Party_Vision: "Other parties",
                    count: 584,
                },
            ],
        },
    ];
    const scale = d3.scaleLinear().domain([0, 2000]).range([2, 50]); // bar width

    // Assign direction per POC type
    const direction = {
        POC: 1,
        IDP: -1,
        Other: 1,
    };
</script>

<!-- spike triangle -->
<svg>
    {#if current_mean === "Sec_Gunshots_Now_N"}
        <path
            d={spike(100)}
            transform={`translate(${width - 20}, ${270})`}
            fill="black"
            stroke="black"
            stroke-width="0.5"
        />
        <line
            x1={width - 20}
            y1="170"
            x2={width - 40}
            y2="170"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 80}
            y={170}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="middle"
        >
            Every night
        </text>
        <path
            d={spike(50)}
            transform={`translate(${width - 30}, ${270})`}
            fill="black"
            stroke="black"
            stroke-width="0.5"
        />
        <line
            x1={width - 30}
            y1="220"
            x2={width - 60}
            y2="220"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 80}
            y={220}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="middle"
        >
            Often
        </text>
        <path
            d={spike(10)}
            transform={`translate(${width - 40}, ${270})`}
            fill="black"
            stroke="black"
            stroke-width="0.5"
        />
        <line
            x1={width - 40}
            y1="260"
            x2={width - 55}
            y2="260"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 80}
            y={260}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="middle"
        >
            Rarely
        </text>
    {:else if current_mean === "test"}
        {#each bars as d}
            {#each d.filteredVisionCounts as party, i}
                <rect
                    x={d.x +
                        (direction[d.poc] === 1 ? -5 : -scale(party.count))}
                    y={d.y - i * 18}
                    width={scale(party.count)}
                    height={15}
                    fill={d.poc === "IDP" ? "gray" : "black"}
                />
            {/each}
        {/each}
        <line
            x1={width - 60}
            y1="240"
            x2={width - 60}
            y2="260"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 55}
            y={270}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            IDP
        </text>
        <line
            x1={width - 30}
            y1="240"
            x2={width - 30}
            y2="260"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 25}
            y={270}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="middle"
        >
            Other
        </text>
        <line
            x1={width - 70}
            y1="172"
            x2={width - 85}
            y2="172"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 90}
            y={172}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            Other
        </text>
        <text
            x={width - 90}
            y={190}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            No Party
        </text>
        <line
            x1={width - 60}
            y1="191"
            x2={width - 85}
            y2="191"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 90}
            y={210}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            Opposition
        </text>
        <line
            x1={width - 70}
            y1="209"
            x2={width - 85}
            y2="209"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 90}
            y={230}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            Government
        </text>
        <line
            x1={width - 65}
            y1="228"
            x2={width - 85}
            y2="228"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
    {:else}
        <rect
            x={width - 30}
            y="170"
            width="4"
            height="70"
            fill="#a6a6a6"
            opacity="0.8"
        />

        <rect x={width - 30} y={190} width="4" height="50" fill="black" />

        <circle
            cx={width - 28}
            cy={190}
            r="5"
            fill="black"
            stroke="black"
            stroke-width="1"
        >
        </circle>
        <line
            x1={width - 40}
            y1="170"
            x2={width - 55}
            y2="170"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 60}
            y={170}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            Safe
        </text>

        <line
            x1={width - 40}
            y1="240"
            x2={width - 55}
            y2="240"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x={width - 60}
            y={240}
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="end"
        >
            Unsafe
        </text>
    {/if}
</svg>

<!-- label at end of line -->
<!-- <text
    x={margin.left + i * 10 + 35}
    y={height - 70 - h}
    font-size="12"
    font-family="Montserrat"
    font-weight="500"
    alignment-baseline="middle"
>
    {spikeLabels[i]}
</text> -->
