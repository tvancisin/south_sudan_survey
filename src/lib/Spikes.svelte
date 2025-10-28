<script>
    export let aggregatedLocations, heightScale, colorScale, spike, indy_locs;
</script>

<!-- {#each aggregatedLocations as d}
    {#if d.x && d.y && d.meanScore != null}
        <path
            d={angledSpike(heightScale(d.meanScore), 45)}
            transform={`translate(${d.x + (["Yirol East"].includes(d.adm2) ? 10 : 0)},${d.y - (["Yirol East"].includes(d.adm2) ? 10 : 0)})`}
            fill="gray"
            fill-opacity="0.5"
        />
    {/if}
{/each} -->

{#each aggregatedLocations as d}
    {#if d.x && d.y && d.meanScore != null}
        <path
            d={spike(heightScale(d.meanScore))}
            transform={`translate(${d.x + (["Yirol East"].includes(d.adm2) ? 10 : 0)},${d.y - (["Yirol East"].includes(d.adm2) ? 10 : 0)})`}
            fill={colorScale(d.poc)}
            fill-opacity="1"
            stroke="black"
            stroke-width="0.5"
        >
            <title>
                mean: {d.meanScore}
            </title>
        </path>
    {/if}
{/each}

{#each indy_locs as d}
    <text
        x={d[1][0].x - 2.5 + (["Yirol East"].includes(d[0]) ? 10 : 0)}
        y={d[1][0].y + (["Yirol East"].includes(d[0]) ? 0 : 10)}
        text-anchor={["Yirol East"].includes(d[0]) ? "start" : "middle"}
        font-size="10"
        font-weight="600"
        font-family="Montserrat"
        fill={d.env == "IDP Camp" ? "black" : "black"}
    >
        {d[0]}
    </text>
{/each}
