FROM aeyde/reactioncommerce:0.0.1

ENV ROOT_URL "https://shop-dev.aeyde.org"

ENV MAIL_URL="smtp://aeydestore@mg.aeyde.org:godsarmy@smtp.mailgun.org:465"

ENV MONGO_URL="mongodb://reaction:reaction@35.156.178.202:27017/reactioncommerce"

ENV REACTION_EMAIL "benno@aeyde.com"
ENV REACTION_USER "benno"
ENV REACTION_AUTH "godsarmy"

EXPOSE 3000
