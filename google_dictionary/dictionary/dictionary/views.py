from django.shortcuts import render


def error_404(request):
    print("None1")
    return render(request,"no-def-100.html")

def error_500(request):
    print("none")
    return render(request,"no-def-100.html")