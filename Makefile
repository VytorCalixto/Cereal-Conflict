all:
	node_modules/.bin/babel src -d .
	mv conflito.js conflito
	chmod +x conflito
