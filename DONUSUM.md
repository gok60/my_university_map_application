docker run --rm `
    -v "${PWD}:/data" `
    stefda/osmium-tool `
    osmium cat -f pbf -o /data/map.pbf /data/map.osm
