<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let wavePeriods, timeScale, height, width, margin, axisGroup;

    $: if (wavePeriods) {
        timeScale = d3
            .scaleTime()
            .domain([
                d3.min(wavePeriods, (d) => d.start),
                d3.max(wavePeriods, (d) => d.end),
            ])
            .range([margin.left, width - margin.right]);
    }

    $: xAxis = d3
        .axisBottom(timeScale)
        .ticks(5)
        .tickFormat(d3.timeFormat("%b %Y"));
    $: if (axisGroup) {
        d3.select(axisGroup).call(xAxis);

        // Change tick font
        d3.select(axisGroup)
            .selectAll("text")
            .style("font-family", "Montserrat")
            .style("font-weight", 500);
    }
</script>

<svg>
    {#each wavePeriods as d, i}
        <rect
            x={timeScale(d.start)}
            y={height - 45}
            width={timeScale(d.end) - timeScale(d.start)}
            height={10}
            fill="black"
            opacity="0.7"
            cursor="pointer"
            role="button"
            tabindex="0"
            on:click={() => dispatch('waveClick', { wave: d.wave })}
            on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dispatch('waveclick', { wave: d.wave });
                }
            }}
            aria-label={`Wave ${i + 1}: ${d.start.toLocaleDateString()} to ${d.end.toLocaleDateString()}`}
        />
        <text
            x={timeScale(d.start)}
            y={height - 50}
            fill="black"
            font-size="10"
            font-weight="500"
            font-family="Montserrat"
        >
            {"Wave " + (i + 1)}
        </text>
    {/each}
    <g bind:this={axisGroup} transform={`translate(0, ${height - 30})`}></g>
</svg>
