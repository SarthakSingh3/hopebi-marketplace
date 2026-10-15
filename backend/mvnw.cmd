@echo off
if exist "C:\Users\HP\tools\apache-maven-3.9.9\bin\mvn.cmd" (
    "C:\Users\HP\tools\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
