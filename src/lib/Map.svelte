<script>
    export let polygon_data, geo_data, pathGenerator;
</script>

{#each polygon_data as feature}
    <!-- {#each geo_data as feature}
        <path
            d={pathGenerator(feature)}
            stroke="black"
            fill="black"
            opacity="0.5"
        />
    {/each} -->

    <!-- polygon -->
    <path
        d={pathGenerator(feature)}
        stroke={feature.properties.ADMIN === "South Sudan" ? "white" : "white"}
        fill={feature.properties.ADMIN === "South Sudan"
            ? "#a6a6a6"
            : "#cccccc"}
    />
    <!-- label -->
    <!-- {#if feature.properties.ADMIN != "South Sudan"}
        <text
            x={pathGenerator.centroid(feature)[0]}
            y={pathGenerator.centroid(feature)[1]}
            text-anchor="middle"
            font-size="14"
            font-family="Montserrat"
            fill="black"
        >
            {feature.properties.ADMIN}
        </text>
    {/if} -->
{/each}
