TESTS = $(shell find . -name "*.test.js")

test:
	@./node_modules/.bin/mocha -u tdd --globals "encoding" -t 8000 $(TESTS) -R spec


.PHONY: test
