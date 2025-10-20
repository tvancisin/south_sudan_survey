<script>
    export let aggregatedLocations,
        colorScale,
        height,
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

{#each aggregatedLocations as d, i}
    {#if current_mean == "Sec_Gunshots_Now_N"}
        <path
            d={spike(heightScale(d.meanScore))}
            transform={`translate(${(i + 2) * 15}, ${height - 50})`}
            fill={colorScale(d.poc)}
            fill-opacity="1"
            stroke="black"
            stroke-width="0.5"
        >
            <title>
                mean: {d.meanScore}
            </title>
        </path>
    {:else if d.x && d.y && d.meanScore != null}
        <g transform={`translate(${(i + 2) * 15}, ${height - 100})`}>
            <!-- 45-degree lines (drawn first) -->
            <!-- {#if d.meanScore > 1}
                {@const diag = getDiagonalLineCoords(d.meanScore)}
                <line
                    x1="0"
                    y1={lineHeight}
                    x2={diag.x}
                    y2={lineHeight + diag.y}
                    stroke="gray"
                    stroke-width="2"
                    stroke-opacity="0.1"
                />
            {/if} -->
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

            <!-- Optional: Scale marks -->
            <!-- <line
                x1="-3"
                y1="0"
                x2="3"
                y2="0"
                stroke="black"
                stroke-width="0.5"
            /> -->
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
<line
    x1="10"
    y1={height - 100 + lineHeight / 2}
    x2="470"
    y2={height - 100 + lineHeight / 2}
    stroke="gray"
    stroke-width="1"
    stroke-opacity="0.5"
    stroke-dasharray="10 5"
/>
