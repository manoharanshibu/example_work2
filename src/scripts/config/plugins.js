import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import React from 'react';
import App from 'app/App';

// add correct version of jquery to Backbone
Backbone.$ = $;

// set up globals
window.$ = $;
window.Backbone = Backbone;
window.React = React;
window._ = _;
window.App = App;

import _s from 'underscore.string';
import cookie from 'js-cookie';

window.Cookies = cookie;

_s.includes = _s.include;
_.mixin(_s.exports());

import moment from 'moment'
import momentLocalizer from 'react-widgets/lib/localizers/moment'

momentLocalizer(moment)

import 'react-widgets/dist/css/react-widgets.css'