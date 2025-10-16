<script>
    export let heightScale, margin, height, spike;

    const spikeLabels = ["Very Unsafe", "Neither Safe, Nor Unsafe", "Very Safe"];
</script>

{#each heightScale.range() as h, i}
    <!-- spike triangle -->
    <path
        d={spike(h)}
        transform={`translate(${margin.left + i * 10}, ${height - 70})`}
        fill="black"
        stroke="black"
        stroke-width="0.5"
    />

    <!-- line from tip of spike -->
    <line
        x1={margin.left + i * 10}
        y1={height - 70 - h}
        x2={margin.left + i * 10 + 30}
        y2={height - 70 - h}
        stroke="black"
        stroke-dasharray="4 2"
        stroke-width="0.5"
    />

    <!-- label at end of line -->
    <text
        x={margin.left + i * 10 + 35}
        y={height - 70 - h}
        font-size="12"
        font-family="Montserrat"
        font-weight="500"
        alignment-baseline="middle"
    >
        {spikeLabels[i]}
    </text>
{/each}
