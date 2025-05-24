docker run --rm `
    -v "${PWD}:/data" `
    stefda/osmium-tool `
    osmium cat -f pbf -o /data/map.pbf /data/map.osm




docker run --rm -v "$(pwd):/data" stefda/osmium-tool osmium cat -f pbf -o /data/map.pbf /data/map.osm



EXCRACT
docker run --rm -t -v D:/uygulama_test/data:/data osrm/osrm-backend `
  osrm-extract -p /opt/foot.lua /data/foot/map.pbf

partition 
docker run --rm -t -v D:/uygulama_test/data:/data osrm/osrm-backend `
  osrm-partition /data/bicycle/map.osrm
CUSTOMİZE
docker run --rm -t -v D:/uygulama_test/data:/data osrm/osrm-backend `
  osrm-customize /data/foot/map.osrm
