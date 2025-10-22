<script>
    export let aggregatedLocations,
        colorScale,
        height,
        width,
        current_mean,
        heightScale,
        spike,
        angledSpike;

    const lineHeight = 70; // Height of the vertical line
    const circleRadius = 3.5;

    // Function to map score (1-5) to vertical position (0-lineHeight)
    function getCircleY(score) {
        return lineHeight - ((score - 1) / 4) * lineHeight; // Inverted scale so higher scores are at the top
    }

    $: console.log(aggregatedLocations);
</script>

<div class="sorted">
    <svg {width} {height}>
        {#if current_mean == "Sec_Gunshots_Now_N"}
            {#each aggregatedLocations as d, i}
                <g transform={`translate(${(i + 2) * 15}, 150)`}>
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
                        transform={`translate(0, ${-heightScale(d.meanScore) - 2}) rotate(-45)`}
                    >
                        <text
                            text-anchor="start"
                            font-family="Montserrat"
                            font-size="10px"
                        >
                            {d.adm2}
                        </text>
                    </g>
                </g>
            {/each}
        {:else}
            {#each aggregatedLocations as d, i}
                <g transform={`translate(${(i + 2) * 15}, 80)`}>
                    <!-- Base vertical line -->
                    <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2={lineHeight}
                        stroke="#a6a6a6"
                        stroke-width="2"
                        stroke-opacity="1"
                    />
                    <text
                        x="0"
                        y="-2"
                        transform="rotate(-45)"
                        font-family="Montserrat"
                        font-size="10px">{d.adm2}</text
                    >

                    <!-- Filled portion of the line -->
                    <line
                        x1="0"
                        y1={lineHeight}
                        x2="0"
                        y2={getCircleY(d.meanScore)}
                        stroke="black"
                        stroke-width="3"
                    />

                    <!-- Score indicator circle -->
                    <circle
                        cx="0"
                        cy={getCircleY(d.meanScore)}
                        r={circleRadius}
                        fill={colorScale(d.poc)}
                        stroke="black"
                        stroke-width="0.5"
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
            <line
                x1="10"
                y1={80 + lineHeight / 2}
                x2="470"
                y2={80 + lineHeight / 2}
                stroke="gray"
                stroke-width="1"
                stroke-opacity="0.5"
                stroke-dasharray="10 5"
            />
        {/if}
    </svg>
</div>

<style>
    .sorted {
        width: 50%;
        height: 160px;
        position: absolute;
        bottom: 5px;
        left: 5px;
    }
</style>
