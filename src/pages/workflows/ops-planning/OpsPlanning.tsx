import React from "react";

type OpsPlanningProps = {};

type OpsPlanningState = {};

class OpsPlanningClass extends React.Component<OpsPlanningProps, OpsPlanningState> {
    /**
     * Summary: this page is a single workflow for an ops planning meeting
     *  - Show all events that are pending approval (how?)
     *  - For each event show events in other venues at the same time
     *  - Show any clashes
     *
     *  TODO:
     *    * Users need to be able to configure which state IDs match review states
     *    * New endpoint for fetching review events which uses these states
     *    * How should gateway persist data? MongoDB? Should this be on a microservice?
     *      * Needs some kind of shared store and we shouldn't add new modules, so mongo will have to do...
     *      * Can link this into logging as well
     *      * Gateway already uses mongo for sessions - need a new collection and maybe move collection
     *    * What to do when states are deleted?
     */
}

export const OpsPlanning = OpsPlanningClass;