import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { NavigationContext, NavigationHandler } from 'navigation-react';
import getStateNavigator from './NavigationShared';
import { searchPeople, getPerson } from './Data';
import { registerView as registerPeopleView } from './People';
import { registerView as registerPersonView } from './Person';

var app = express();

app.use(express.static('js'))

app.get('/favicon.ico', function(req, res) {
    res.statusCode = 404;
    res.end();
});

app.get('*', function(req, res) {
    var stateNavigator = getStateNavigator();
    registerControllers(stateNavigator);
    registerPeopleView(stateNavigator);
    registerPersonView(stateNavigator);    
    stateNavigator.onNavigate(function(oldState, state, data, asyncData) {
        res.set('vary', 'content-type');
        if (req.get('content-type') === 'application/json') {
            res.send(JSON.stringify(asyncData));
        } else {
            res.send(`<html>
                <head>
                    <title>Isomorphic Navigation Code Splitting</title>
                    <style>
                        table{border-collapse:collapse;}
                        table,td,th{border:1px #000 solid;}
                        .label{margin-left:50px;width:100px;float:left;}
                    </style>
                </head>
                <body>
                    <div id="content">${ReactDOMServer.renderToString(
                        <NavigationHandler stateNavigator={stateNavigator}>
                            <NavigationContext.Consumer>
                                {({ state, asyncData }) => state.renderView(asyncData)}
                            </NavigationContext.Consumer>        
                        </NavigationHandler>
                    )}</div>
                    <script>var serverProps = ${safeStringify(asyncData)};</script>
                    <script src="/app.js" ></script>
                </body>
            </html>`);
        }
    });
    stateNavigator.start(req.url);
});

app.listen(8080);

/**
 * Attaches the navigation hooks to the two States. The navigating hook, fired
 * just before the State becomes active, calls into the data layer and adds the 
 * retrieved person data onto the state 
 */
function registerControllers(stateNavigator, callback) {
    stateNavigator.states.people.navigating = function(data, url, navigate) {
        searchPeople(data.pageNumber, function(people) {
            navigate({people: people});
        });
    }
    stateNavigator.states.person.navigating = function(data, url, navigate) {
        getPerson(data.id, function(person) {
            navigate({person: person});
        });
    }
}

function safeStringify(props) {
  return JSON.stringify(props).replace(/<\/script/g, '<\\/script').replace(/<!--/g, '<\\!--');
}