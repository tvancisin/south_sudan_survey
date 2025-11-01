<script>
    export let polygon_data,
        geo_data,
        disputed_data,
        regions_data,
        pathGenerator;
</script>

{#each polygon_data as feature}
    <!-- Define the shadow filter once -->
    <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
                dx="2"
                dy="2"
                stdDeviation="5"
                flood-color="rgba(0,0,0,0.1)"
            />
        </filter>
    </defs>
    {#each regions_data as feature}
        <path
            d={pathGenerator(feature)}
            fill={feature.properties.ADMIN == "Pibor" ||
            feature.properties.ADMIN == "Ruweng"
                ? "#bfbfbf"
                : "white"}
            stroke="gray"
            opacity="0.4"
            filter="url(#shadow)"
        />
    {/each}
    {#each disputed_data as feature}
        <path
            d={pathGenerator(feature)}
            fill="#666666"
            fill-opacity="0.6"
            stroke="gray"
            opacity="0.2"
            filter="url(#shadow)"
        />
    {/each}
    <!-- Apply it to your path -->
    <path
        d={pathGenerator(feature)}
        stroke={feature.properties.ADMIN === "South Sudan"
            ? "#b3b3b3"
            : "#b3b3b3"}
        stroke-opacity={feature.properties.ADMIN === "South Sudan"
            ? "1"
            : "0.3"}
        fill={feature.properties.ADMIN === "South Sudan" ? "#f2f2f2" : "white"}
        fill-opacity="0.5"
        filter="url(#shadow)"
    />
{/each}
{#each geo_data as feature}
    <path
        d={pathGenerator(feature)}
        stroke="steelblue"
        stroke-width="3"
        fill="none"
        opacity="0.5"
    />
{/each}
