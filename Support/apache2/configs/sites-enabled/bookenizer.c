<VirtualHost 192.168.1.16:80> 
     ServerAdmin squire@bookenizer.c
     ServerName bookenizer.c
     ServerAlias bookenizer.c
     DocumentRoot /srv/www/Bookenizer/
     ErrorLog /srv/www/bookenizer.c/logs/error.log 
     CustomLog /srv/www/bookenizer.c/logs/access.log combined
     ProxyPass /bookenizer-stubs/hms-services/ http://bookenizer.c:8082/bookenizer-stubs/hms-services/
</VirtualHost>
