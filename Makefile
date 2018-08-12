
Deploy:
	docker build -t labeltool .
	
	# push to avatest
	docker tag labeltool reg.qiniu.com/avatest/labeltool:v1.1
	docker push reg.qiniu.com/avatest/labeltool:v1.1
