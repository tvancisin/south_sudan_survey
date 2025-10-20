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
        stroke={feature.properties.ADMIN === "South Sudan" ? "gray" : "gray"}
        fill={feature.properties.ADMIN === "South Sudan"
            ? "white"
            : "#f2f2f2"}
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
