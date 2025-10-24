<script>
    import * as d3 from "d3";
    export let test, indy_locs;
    const maxCount = d3.max(
        test.flatMap((d) => d.filteredVisionCounts.map((p) => p.count)),
    );
    const scale = d3.scaleLinear().domain([0, maxCount]).range([2, 50]); // bar width

    // Assign direction per POC type
    const direction = {
        POC: 1,
        IDP: -1,
        Other: 1,
    };

    // todo combine everyting apart first three
</script>

{#each test as d}
    {#if d.poc != "POC" && d.adm2 != "Yirol East"}
        {console.log(d)}
        {#each d.filteredVisionCounts as party, i}
            <rect
                x={d.x + (direction[d.poc] === 1 ? -5 : -scale(party.count))}
                y={d.y - 10 - i * 11}
                width={scale(party.count)}
                height={10}
                fill={d.poc === "IDP" ? "gray" : "black"}
            />
        {/each}
    {/if}
    <!-- {#if d.poc == "Other" && d.adm2 != "Yirol East"}
        <rect
            x={d.x  -8}
            y={d.y - 10 - (d.filteredVisionCounts.length - 1) * 13}
            width={1}
            height={50}
            fill="#a6a6a6"
            opacity="0.8"
        />
    {/if} -->
{/each}

{#each indy_locs as d}
    {#if d[0] != "Yirol East"}
        <text
            x={d[1][0].x - 2.5 + (["Gogrial West"].includes(d[0]) ? -10 : 0)}
            y={d[1][0].y + (["Gogrial West"].includes(d[0]) ? 10 : 10)}
            text-anchor={["Gogrial West"].includes(d[0]) ? "start" : "middle"}
            font-size="10"
            font-weight="600"
            font-family="Montserrat"
            fill={d.env == "IDP Camp" ? "black" : "black"}
        >
            {d[0]}
        </text>
    {/if}
{/each}
