<script>
    import * as d3 from "d3";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let wavePeriods, timeScale, height, width, margin, axisGroup;

    $: time_width = width / 2;
    $: if (wavePeriods) {
        timeScale = d3
            .scaleTime()
            .domain([
                d3.min(wavePeriods, (d) => d.start),
                d3.max(wavePeriods, (d) => d.end),
            ])
            .range([margin.left, time_width - margin.right]);
    }

    $: xAxis = d3
        .axisBottom(timeScale)
        .ticks(5)
        .tickFormat(d3.timeFormat("%b %Y"));

    $: if (axisGroup) {
        d3.select(axisGroup)
            .call(xAxis)
            .selectAll("text")
            .style("font-family", "Montserrat")
            .style("font-weight", 500);
    }
</script>

<div class="timeline">
    <svg width={width / 2}>
        {#each wavePeriods as d, i}
            <rect
                x={timeScale(d.start)}
                y={115}
                width={timeScale(d.end) - timeScale(d.start)}
                height={10}
                fill="black"
                opacity="0.7"
                cursor="pointer"
                role="button"
                tabindex="0"
                on:click={() => dispatch("waveClick", { wave: d.wave })}
                on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        dispatch("waveclick", { wave: d.wave });
                    }
                }}
                aria-label={`Wave ${i + 1}: ${d.start.toLocaleDateString()} to ${d.end.toLocaleDateString()}`}
            />
            <text
                x={timeScale(d.start) }
                y={115}
                fill="black"
                font-size="10"
                font-weight="600"
                font-family="Montserrat"
                transform={`rotate(-45, ${timeScale(d.start) }, 105)`}
            >
                {"Wave " + (i + 1)}
            </text>
        {/each}
        <g bind:this={axisGroup} transform={`translate(0, ${130})`}></g>
    </svg>
</div>

<style>
    .timeline {
        width: 50%;
        height: 150px;
        position: absolute;
        bottom: 5px;
        right: 5px;
    }
</style>
