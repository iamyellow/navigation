import { StateNavigator, HTML5HistoryManager } from 'navigation';

export default function() {
    return new StateNavigator([
        {key: 'people', route: '{pageNumber?}', defaults: {pageNumber: 1}},
        {key: 'person', route: 'person/{id}', defaults: {id: 0}, trackCrumbTrail: true}
    ], new HTML5HistoryManager());
};
