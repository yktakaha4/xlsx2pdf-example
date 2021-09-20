FROM public.ecr.aws/lambda/nodejs:12

RUN yum update -y
RUN yum install -y tar gzip ipa-gothic-fonts.noarch ipa-mincho-fonts.noarch ipa-pgothic-fonts.noarch ipa-pmincho-fonts.noarch

# install libreoffice dependencies
RUN yum install -y dbus-libs cups-libs cairo libSM

# install libreoffice
# https://www.libreoffice.org/download/download/
RUN cd "$(mktemp -d)" \
  && curl -OL https://ftp-srv2.kddilabs.jp/office/tdf/libreoffice/stable/7.2.1/rpm/x86_64/LibreOffice_7.2.1_Linux_x86-64_rpm.tar.gz \
  && tar -xvf *.tar.gz \
  && yum install -y LibreOffice_*/RPMS/*.rpm \
  && ln -s /opt/libreoffice*/program/soffice.bin /usr/local/bin/soffice \
  && rm -rvf *

# https://github.com/sbraconnier/jodconverter/issues/48
RUN soffice || [[ $? -eq 81 ]] && echo "profile created."

WORKDIR /opt/build

COPY . .

RUN npm ci
RUN npm run build

CMD ["dist/index.handler"]
