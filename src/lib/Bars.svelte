<script>
    import * as d3 from "d3";
    export let test, indy_locs;
    let scaleLinear = d3.scaleLinear().domain([0, 1000]).range([0, 50]);
    const maxCount = d3.max(
        test.flatMap((d) => d.filteredVisionCounts.map((p) => p.count)),
    );
    const scale = d3.scaleLinear().domain([0, maxCount]).range([0, 40]); // bar width
    
    // Assign direction per POC type
    const direction = {
        POC: 1,
        IDP: -1,
        Other: 1,
    };



    // todo combine everyting apart first three
</script>

{#each test as d}
    {#if d.x && d.y}
    {console.log(d)}
        {#each d.filteredVisionCounts as party, i}
            {console.log(party)}
            <rect
                x={d.x + (direction[d.poc] === 1 ? -5 : -scale(party.count))}
                y={d.y -5 - (i * 7)}
                width={scale(party.count)}
                height={5}
                fill={d.poc === "IDP" ? "gray" : "black"}
                stroke="none"
            />
        {/each}
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
        font-weight="500"
        font-family="Montserrat"
        fill={d.env == "IDP Camp" ? "black" : "black"}
    >
        {d[0]}
    </text>
{/each}
