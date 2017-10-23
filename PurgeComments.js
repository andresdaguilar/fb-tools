#!/usr/bin/env node

var { FB, FacebookApiException } = require("fb");
//const REGEX = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?/i;

const REGEX = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/i;
const EREGEX = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/i;
const IDREGEX = /id=\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/i;
const SREGEX = /\/*\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*\//i;

var program = require("commander");

program.version("0.1.0").option("-o, --offset [offset]", "Offset", parseInt);
//

program.command("remove-comments <access-token>").action(function(cmd) {
	let offset = program.offset || 0;
	FB.setAccessToken(cmd);

	FB.api(
		"/me/posts",
		"GET",
		{
			fields: "comments{can_hide,message, is_hidden}",
			limit: "100",
			pretty: "0",
			offset,
		},
		function(response) {
			for (var p of response.data) {
				if (p["comments"]) {
          console.log(p.comments.paging)
					let commentsWithPhones = p.comments.data.filter(
						m =>
							!(
								IDREGEX.test(m.message) ||
								SREGEX.test(m.message)
							) && REGEX.test(m.message)
					);
					commentsWithPhones.forEach(m =>
						console.log(m.id, m.message, m.can_hide, m.is_hidden)
					);
					if (commentsWithPhones.filter(m => !m.is_hidden).length) {
						for (var m of commentsWithPhones
							.filter(m => !m.is_hidden)
							.filter(m => m.can_hide)) {
							FB.api(
								`/${m.id}`,
								"POST",
								{
									is_hidden: true,
								},
								function(response2) {
									console.log(response2);
									if (response2 && !response2.error) {
										/* handle the result */
									}
								}
							);
						}
					}
				}
			}
		}
	);
});
program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
