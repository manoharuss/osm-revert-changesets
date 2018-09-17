'use strict';
const rp = require('request-promise-native');
const rules = require('./rules');

function revertedChangesets(changesetID){
  return fetchChangeset(changesetID).then((changeset) => {
    return getFeatureHistory(getPreviousChangesets(changeset)).then((oldFeatureVersions) => {
      const nthVersions = changeset.map((feature) => feature.new);
      const nMinusOneVersions = oldFeatureVersions.map((feature) => feature.new);
      const nMinusTwoVersions = oldFeatureVersions.map((feature) => feature.old);
      const revertedIndexes = rules.getRevertedIndexes(nthVersions, nMinusOneVersions.concat(nMinusTwoVersions));
      return listRevertedChangesets(revertedIndexes, changeset, changesetID);
    });
  }).catch((error) => console.error(error));
}

function listRevertedChangesets(indexes, changeset, changesetID){
  const changesetsList = [];
  for (let i=0; i < indexes.length; i++){
    if (indexes[i]){
      changesetsList.push(changeset[i].old.properties['osm:changeset'].toString());
    }
  }
  const uniqueIds = changesetsList.filter((v, i, a) => a.indexOf(v) === i && v !== changesetID);
  if (uniqueIds.length === 0) {
    return false;
  } return uniqueIds;
}

function fetchChangeset(changesetID) {
  return rp('https://s3.amazonaws.com/mapbox/osm-adiff-compare/production/' + changesetID + '.json')
    .then((response) => JSON.parse(response))
    .catch((error) => console.error(`ERROR ${changesetID}`, error));
}

function getFeatureHistory(changesetIds) {
  return getChangesetFeatures(changesetIds).then((changesetArray) => {
    const featuresArray = [];
    changesetArray.forEach((changeset) => {
      changeset.forEach((feature) => {
        featuresArray.push(feature);
      });
    });
    return featuresArray;
  });
}

function getChangesetFeatures(changesets){
  return Promise.all(changesets.map((id) => {
    return fetchChangeset(id);
  }));
}

function getPreviousChangesets(changeset) {
  const changesetList = changeset.map((feature) => {
    if (feature && feature.old && feature.old.properties) {
      return feature.old.properties['osm:changeset'];
    } return null;
  });
  return changesetList.filter((v, i, a) => a.indexOf(v) === i && v !== null);
}

module.exports = revertedChangesets;
