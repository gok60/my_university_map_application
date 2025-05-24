docker run --rm `
    -v "${PWD}:/data" `
    stefda/osmium-tool `
    osmium cat -f pbf -o /data/map.pbf /data/map.osm




docker run --rm -v "$(pwd):/data" stefda/osmium-tool osmium cat -f pbf -o /data/map.pbf /data/map.osm
