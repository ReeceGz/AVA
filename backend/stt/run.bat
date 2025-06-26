@echo off
echo Transcribing response.mp3 …
whisper.exe -f response.mp3 -m models\ggml-base.en.bin -l en --output-txt
echo.
echo Transcript output:
type sample.txt
pause
