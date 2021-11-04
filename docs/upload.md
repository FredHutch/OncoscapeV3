# Uploading a Dataset

You can upload your own private dataset to Oncoscape. Oncoscape uses the cBioPortal file format conventions, which stores data in tab-separated files.
We also support several extensions to those conventions, which allow for cutomization of views, etc. After preparing your files, you can combine them in a zip file, and upload them to Oncoscape.

## The cBioPortal Formats
https://github.com/cBioPortal/cbioportal/blob/master/docs/Data-Loading.md

## Oncoscape Extensions to cBioPortal Format
* Survival data in a patient file can be of etiher cBioPortal format or GDC/TCGA format.
    * cBioPortal fields : OS_STATUS=[LIVING|DECEASED], OS_MONTHS
    * GDC/TCGA fields: vital_status=[alive, dead, unknown], days_to_last_follow_up, days_to_death
* Timeline visualization allows customization
    * Each event file can appear in any number of tracks, or share the same track.
    * Shapes and colors can be defined for each "subtype", or discrete value of an event type.
    * These can be put into the meta file for a patient timeline file, with the addition of an "oncoscape_bar_override" line. For example:
        `oncoscape_bar_override: {"version": "1.0", "sortFields": ["bestresponsevalue"], "bandHeight": "0.6", "label": "radiation",  "subtypeColors": {"single fraction": "#442323", "xrt": "#6688FF" }}`



## Video of Mechanics of Uploading Zip File to Oncoscape
https://beta.oncoscape.sttrcancer.org/assets/videos/upload_dataset.mp4

## Publishing a Private Dataset
You can ask the Oncoscape team to copy your private dataset to a publically-available address. This involves manual processes on the back end, so it's not possible yet to do this kind of publishing without our assistance. In addition to being publically available, the dataset will also open to a particular visualization and color legend of your choosing. For assistance, contact us at contact@oncoscape.org .
