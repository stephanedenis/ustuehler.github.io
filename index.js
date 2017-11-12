#!/usr/bin/env node

/*
 * This is invoked as shell script by NPM
 */

var $tw = require('tiddlywiki/boot/boot.js').TiddlyWiki()

// Pass the command line arguments to the boot kernel
$tw.boot.argv = ['editions/hack', '--server', '8081']

// Boot the TW5 app
$tw.boot.boot()
