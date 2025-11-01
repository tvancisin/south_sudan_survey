<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let test, indy_locs, current_mean, colorScale, aggregatedLocations;

    const lineHeight = 70; // Height of the vertical line
    let sizeScale;
    $: sizeScale =
        current_mean === "Sec_Gunshots_Now_N"
            ? d3.scaleLinear().domain([1, 3]).range([8, 20])
            : d3.scaleLinear().domain([1, 5]).range([8, 20]);

    // Adjusted getCircleY
    function getCircleY(score) {
        if (current_mean === "Sec_Gunshots_Now_N") {
            // Score in 1-3 → map to 0-lineHeight
            return lineHeight - ((score - 1) / 2) * lineHeight;
        } else {
            // Score in 1-5 → map to 0-lineHeight
            return lineHeight - ((score - 1) / 4) * lineHeight;
        }
    }
    const maxCount = d3.max(
        test.flatMap((d) => d.filteredVisionCounts.map((p) => p.count)),
    );
    const scale = d3.scaleLinear().domain([0, maxCount]).range([2, 25]); // bar width

    // Assign direction per POC type
    const direction = {
        IDP: -1,
        Other: 1,
    };

    let just_one = [];
    let selectedAdm2 = null;

    function handleBarsClick(value) {
        selectedAdm2 = value; // store the selection
    }

    // Automatically recompute just_one when aggregatedLocations or selectedAdm2 change
    $: if (aggregatedLocations && selectedAdm2) {
        just_one = aggregatedLocations.filter((d) => d.adm2 === selectedAdm2);
    }
</script>

{#each indy_locs as d}
    {#if d[0] != "Yirol East"}
        <g
            transform={`translate(${
                d[1][0].x -
                2.5 +
                (["Yirol West", "Gogrial West", "Bor South"].includes(d[0])
                    ? 25
                    : 0)
            }, ${
                d[1][0].y +
                (["Gogrial West"].includes(d[0]) ? 0 : 10) +
                (["Wau", "Juba"].includes(d[0]) ? 30 : 0)
            })`}
        >
            <rect
                x={-(d[0].length * 3 + 10)}
                y="-67"
                width={65}
                height="60"
                fill="white"
                opacity="0.5"
            />
        </g>
    {/if}
{/each}

{#each test as d, i}
    {#if d.poc != "POC" && d.adm2 != "Yirol East"}
        {#each d.filteredVisionCounts as party, i}
            <rect
                x={d.x +
                    (d.adm2 === "Yirol East"
                        ? 40
                        : ["Gogrial West", "Bor South", "Yirol West"].includes(
                                d.adm2,
                            )
                          ? 20
                          : 0) +
                    (direction[d.poc] === 1 ? -5 : -scale(party.count))}
                y={d.y -
                    25 -
                    i * 27 +
                    (["Yirol East", "Gogrial West"].includes(d.adm2)
                        ? -10
                        : 0) +
                    (["Wau", "Juba"].includes(d.adm2) ? 30 : 0)}
                width={scale(party.count)}
                height={25}
                fill={d.poc === "IDP" ? "#808080" : "black"}
            />
        {/each}
    {/if}
{/each}

{#each indy_locs as d}
    {#if d[0] != "Yirol East"}
        <g
            transform={`translate(${
                d[1][0].x -
                2.5 +
                (["Yirol West", "Gogrial West", "Bor South"].includes(d[0])
                    ? 25
                    : 0)
            }, ${
                d[1][0].y +
                (["Gogrial West"].includes(d[0]) ? 0 : 10) +
                (["Wau", "Juba"].includes(d[0]) ? 30 : 0)
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
                y="-65"
                width={d[0].length * 6 + 8}
                height="60"
                fill="white"
                rx="2"
                opacity="0"
                cursor="pointer"
                on:click={() => handleBarsClick(d[0])}
            />
        </g>
    {/if}
{/each}

{#if just_one && just_one.length}
    <!-- Compute adjusted x and y positions using same logic as your g transforms -->
    {@const adjustedPositions = just_one.map((d) => ({
        x:
            d.x +
            (d.adm2 === "Yirol East"
                ? 40
                : ["Gogrial West", "Bor South", "Yirol West"].includes(d.adm2)
                  ? 20
                  : 0),
        y:
            d.y -
            lineHeight * 2 +
            10 +
            (["Yirol East", "Gogrial West"].includes(d.adm2) ? -10 : 0) +
            (["Wau", "Juba", "Renk"].includes(d.adm2) ? 30 : 0),
    }))}

    <!-- Background rectangle positioned behind the chart -->
    <rect
        x={Math.min(...adjustedPositions.map((d) => d.x)) - 20}
        y={Math.min(...adjustedPositions.map((d) => d.y)) - 10}
        width={Math.max(...adjustedPositions.map((d) => d.x)) -
            Math.min(...adjustedPositions.map((d) => d.x)) +
            40}
        height="82"
        fill="white"
        opacity="0.8"
    />

    <!-- Foreground chart elements -->
    {#each just_one as d}
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
                        lineHeight * 2 +
                        10 +
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
                    stroke-width="1"
                />
                <rect
                    x="0"
                    y="0"
                    width="3"
                    height={lineHeight}
                    fill="#cccccc"
                />
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
            </g>
        {/if}
    {/each}
{/if}
