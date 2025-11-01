<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let elections, height, colorScale, indy_locs, aggregatedLocations;

    const lineHeight = 70;

    // Reactive scale for icon size
    let sizeScale = d3.scaleLinear().domain([1, 3]).range([8, 20]);

    // Adjusted getCircleY
    function getCircleY(score) {
        return lineHeight - ((score - 1) / 2) * lineHeight;
    }

    function getCircleYSafety(score) {
        return lineHeight - ((score - 1) / 4) * lineHeight;
    }

    function handleBarsClick(value) {
        console.log("here", value);

        // do something local if needed...
        // then dispatch event with details
        dispatch("barClick", { value });
    }
    let showElections = true;

    function toggleCharts() {
        showElections = !showElections;
    }
</script>

<!-- The toggle button inside the SVG -->
<g
    on:click={toggleCharts}
    cursor="pointer"
    transform={`translate(10, ${height - 150})`}
>
    <!-- Background rectangle -->
    <rect x="0" y="0" width="110" height="30" fill="steelblue" rx="3" ry="3" />

    <!-- Text -->
    <text
        x="55"
        y="15"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Montserrat"
        font-size="14"
        fill="white"
        pointer-events="none"
    >
        {showElections ? "Show Safety" : "Show Election"}
    </text>
</g>

{#if showElections}
    <!-- Elections chart -->
    {#each elections as d}
        {#if d.x && d.y && d.meanScore != null}
            <g
                transform={`translate(
                        ${
                            d.x +
                            (d.adm2 === "Yirol East"
                                ? 40
                                : [
                                        "Gogrial West",
                                        "Bor South",
                                        "Yirol West",
                                    ].includes(d.adm2)
                                  ? 20
                                  : 0)
                        },
                        ${
                            d.y -
                            lineHeight +
                            (["Yirol East", "Gogrial West"].includes(d.adm2)
                                ? -10
                                : 0) +
                            (["Wau", "Juba", "Renk"].includes(d.adm2) ? 30 : 0)
                        }
                    )`}
            >
                <rect x="0" y="0" width="3" height={lineHeight} fill="#ccc" />
                <rect
                    x="0"
                    y={getCircleY(d.meanScore)}
                    width="3"
                    height={lineHeight - getCircleY(d.meanScore)}
                    fill="black"
                />
                <circle
                    cx="1.5"
                    cy={getCircleY(d.meanScore)}
                    r="4"
                    stroke="black"
                    fill={colorScale(d.poc)}
                />
                <line
                    x1="-10"
                    y1={lineHeight}
                    x2="10"
                    y2={lineHeight}
                    stroke="gray"
                />
            </g>
        {/if}
    {/each}
{:else}
    <!-- Aggregated locations chart -->
    {#each aggregatedLocations as d}
        {#if d.x && d.y && d.meanScore != null}
            <g
                transform={`translate(
                        ${
                            d.x +
                            (d.adm2 === "Yirol East"
                                ? 40
                                : [
                                        "Gogrial West",
                                        "Bor South",
                                        "Yirol West",
                                    ].includes(d.adm2)
                                  ? 20
                                  : 0)
                        },
                        ${
                            d.y -
                            lineHeight +
                            (["Yirol East", "Gogrial West"].includes(d.adm2)
                                ? -10
                                : 0) +
                            (["Wau", "Juba", "Renk"].includes(d.adm2) ? 30 : 0)
                        }
                    )`}
            >
                <line
                    x1="-10"
                    y1={lineHeight}
                    x2="10"
                    y2={lineHeight}
                    stroke="gray"
                />
                <rect x="0" y="0" width="3" height={lineHeight} fill="#ccc" />
                <rect
                    x="0"
                    y={getCircleYSafety(d.meanScore)}
                    width="3"
                    height={lineHeight - getCircleYSafety(d.meanScore)}
                    fill="black"
                />
                <circle
                    cx="1.5"
                    cy={getCircleYSafety(d.meanScore)}
                    r="4"
                    stroke="black"
                    fill={colorScale(d.poc)}
                />
            </g>
        {/if}
    {/each}
{/if}
{#each indy_locs as d}
    <g
        transform={`translate(${
            d[1][0].x -
            2.5 +
            (d[0] === "Yirol East"
                ? 40
                : ["Gogrial West", "Bor South", "Yirol West"].includes(d[0])
                  ? 20
                  : 0)
        }, ${
            d[1][0].y +
            (["Yirol East", "Gogrial West"].includes(d[0]) ? 0 : 10) +
            (["Wau", "Juba", "Renk"].includes(d[0]) ? 30 : 0)
        })`}
    >
        <rect
            x={-(d[0].length * 3 + 4)}
            y="-7"
            width={d[0].length * 6 + 8}
            height="14"
            fill="white"
            rx="2"
            opacity="0.8"
        />

        <!-- Text centered on the same 0,0 -->
        <text
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="10"
            font-weight="600"
            font-family="Montserrat"
            fill={d.env == "IDP Camp" ? "black" : "black"}
        >
            {d[0]}
        </text>
        />
        <!-- Background rect centered on 0,0 -->
        <rect
            x={-(d[0].length * 3 + 4)}
            y="-7"
            width={d[0].length * 6 + 8}
            height="14"
            fill="white"
            rx="2"
            opacity="0"
        />
    </g>
{/each}
