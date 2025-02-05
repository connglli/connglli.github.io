SRC := index.md.html
DST := index.html


.PHONY: html push clean

html: $(DST)

$(DST): $(SRC) 
	cp $(SRC) $(DST)
	sed '' "s/\[##UPDATE_TIME##\]/$(shell date "+%Y-%m-%d")/g" $(DST)

push: html
	git add --all
	git commit --allow-empty -m "Update"
	git push

clean:
	rm -rf $(DST)
