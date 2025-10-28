<script>
    import * as d3 from "d3";
    export let heightScale,
        margin,
        height,
        width,
        current_mean,
        spike,
        bars,
        elections_check;

    const spikeLabels = [
        "Very Unsafe",
        "Neither Safe, Nor Unsafe",
        "Very Safe",
    ];
    $: bars_sample = [
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

<svg>
    {#if bars}
        {#each bars_sample as d}
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
    {:else if elections_check}
        <rect
            x={width - 30}
            y="170"
            width="6"
            height="70"
            fill="#a6a6a6"
            opacity="0.3"
        />
        <rect
            x={width - 30}
            y={190}
            width="6"
            height="50"
            fill="gray"
            opacity="0.7"
        />
        <image
            href="./el_gray.svg"
            x={width - 37}
            y={180}
            width={22}
            height={22}
        >
        </image>
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
            Soon
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
            Never
        </text>
    {:else if current_mean === "Sec_Gunshots_Now_N"}
        <rect
            x={width - 30}
            y="170"
            width="6"
            height="70"
            fill="#a6a6a6"
            opacity="0.3"
        />
        <rect
            x={width - 30}
            y={190}
            width="6"
            height="50"
            fill="gray"
            opacity="0.7"
        />
        <image
            href="./bullet_gray.svg"
            x={width - 38}
            y={180}
            width={22}
            height={22}
        >
        </image>
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
            Every Night
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
            Never
        </text>
    {:else}
        <rect
            x={width - 30}
            y="170"
            width="6"
            height="70"
            fill="#a6a6a6"
            opacity="0.3"
        />

        <rect
            x={width - 30}
            y={190}
            width="6"
            height="50"
            fill="gray"
            opacity="0.7"
        />

        <svg
            x={width - 38}
            y={180}
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="gray"
            stroke="black"
            stroke-width="1"
        >
            <path
                d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"
            />
        </svg>
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
