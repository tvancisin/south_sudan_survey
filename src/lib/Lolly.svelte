<script>
    export let aggregatedLocations, heightScale, colorScale, indy_locs;

    const lineHeight = 70; // Height of the vertical line

    // Function to map score (1-5) to vertical position (0-lineHeight)
    function getCircleY(score) {
        return lineHeight - ((score - 1) / 4) * lineHeight; // Inverted scale so higher scores are at the top
    }

    // Calculate the length and coordinates for 45-degree lines
    function getDiagonalLineCoords(score) {
        const filledHeight = lineHeight - getCircleY(score); // Height of the filled portion
        const offset = filledHeight / Math.sqrt(2); // Length for 45-degree line
        return {
            x: offset, // For 45 degrees, x and y offsets are equal
            y: -offset,
        };
    }
</script>

{#each aggregatedLocations as d}
    {#if d.x && d.y && d.meanScore != null}
        <g
            transform={`translate(${d.x + (["Yirol East", "Gogrial West"].includes(d.adm2) ? 20 : 0)},
            ${d.y - lineHeight + (["Yirol East", "Gogrial West"].includes(d.adm2) ? -10 : 0)})`}
        >
            <!-- Background bar -->
            <rect
                x="-3"
                y="0"
                width="4"
                height={lineHeight}
                fill="#a6a6a6"
                opacity="0.8"
            />

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
                cx="-1"
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
    {/if}
{/each}
{#each indy_locs as d}
    <text
        x={d[1][0].x -
            2.5 +
            (["Yirol East", "Gogrial West"].includes(d[0]) ? 10 : 0)}
        y={d[1][0].y + (["Yirol East", "Gogrial West"].includes(d[0]) ? 0 : 10)}
        text-anchor={["Yirol East", "Gogrial West"].includes(d[0])
            ? "start"
            : "middle"}
        font-size="10"
        font-weight="600"
        font-family="Montserrat"
        fill={d.env == "IDP Camp" ? "black" : "black"}
    >
        {d[0]}
    </text>
{/each}
