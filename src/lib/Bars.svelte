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
        POC: 1,
        IDP: -1,
        Other: 1,
    };

    function handleBarsClick(value) {
        console.log("here", value);

        // do something local if needed...
        // then dispatch event with details
        dispatch("barClick", { value });
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
                x={-(d[0].length * 3 + 4)}
                y="-67"
                width={60}
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
                    (direction[d.poc] === 1 ? -8 : -scale(party.count))}
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
                y="-7"
                width={d[0].length * 6 + 8}
                height="14"
                fill="white"
                rx="2"
                opacity="0"
                cursor="pointer"
                on:click={() => handleBarsClick(d[0])}
            />
        </g>
    {/if}
{/each}
