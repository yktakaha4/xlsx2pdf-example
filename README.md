# xlsx2pdf-example

```
$ docker build -t xlsx2pdf-example .
$ docker run -v "$(pwd)/vol:/opt/vol" --entrypoint bash -it xlsx2pdf-example

$ soffice --convert-to pdf --outdir /opt/vol/ /opt/vol/*.xlsx
```
