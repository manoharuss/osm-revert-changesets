'use strict';
const deepEquals = require('deep-equal');

function getRevertedIndexes(latestVersions, previousVersions){
  const revertedFeatureIndexes = [];
  latestVersions.forEach((newFeature) => {
    revertedFeatureIndexes.push(checkReversion(newFeature, findOlderFeatureInArray(newFeature, previousVersions)));
  });
  return revertedFeatureIndexes;
}

function checkReversion(newFeature, oldFeature){
  const newVersion = Object.assign({},newFeature);
  const oldVersion = Object.assign({},oldFeature);
  return revertCreatedFeature(newVersion) || revertModifiedFeature(newVersion, oldVersion);
}

function findOlderFeatureInArray(newFeature, OldFeaturesArray){
  return OldFeaturesArray.filter((feature) => !!feature && feature.properties && feature.properties['osm:id'] === newFeature.properties['osm:id'] && ((feature.properties['osm:version'] + 2) === newFeature.properties['osm:version']))[0];
}

function findRevertedVersionInArray(newFeature, previousVersions){
  return previousVersions.filter((feature) => !!feature && feature.properties && feature.properties['osm:id'] === newFeature.properties['osm:id'] && (feature.properties['osm:version'] + 1 === newFeature.properties['osm:version']));
}

function raw(feature){
  if(!feature || feature === null) return feature;
  const json = Object.assign({},feature);
  const stripProperties = [
    'visible',
    'action',
    'changeType',
    'osm:id',
    'osm:version',
    'osm:timestamp',
    'osm:changeset',
    'osm:uid',
    'osm:user',
    'osm:user:mapping_days',
    'osm:user:changesetcount',
    'osm:user:firstedit',
    'osm:user:num_changes',
    'created_by'
  ];
  stripProperties.forEach((property) => {
    if (!!json && !!json.properties && !!json.properties[property]) delete json.properties[property];
  });
  return json;
}

// revert rules
function revertCreatedFeature(newFeature) {
  return newFeature && newFeature.deleted && newFeature.properties['osm:version'] === 2;
}

function revertModifiedFeature(newFeature, oldFeature) {
  return deepEquals(raw(newFeature), raw(oldFeature));
}

module.exports.getRevertedIndexes = getRevertedIndexes;
