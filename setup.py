from setuptools import setup, find_packages

setup(
    name="ai-discovery-agent",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.31.0",
        "PyGithub>=2.1.1",
        "huggingface-hub>=0.19.0",
        "pymongo>=4.6.0",
        "python-dotenv>=1.0.0",
    ],
)
