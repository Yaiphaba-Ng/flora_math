import importlib
import pkgutil
from typing import Dict
from .modules.base_module import BaseQuizModule
from . import modules

class QuizRegistry:
    def __init__(self):
        self._modules: Dict[str, BaseQuizModule] = {}
        self._discover_modules()

    def _discover_modules(self):
        """Iterates over the modules folder and actively loads components."""
        package = modules
        for _, module_name, _ in pkgutil.iter_modules(package.__path__):
            if module_name == "base_module":
                continue
                
            full_module_name = f"{package.__name__}.{module_name}"
            mod = importlib.import_module(full_module_name)
            
            if hasattr(mod, "register"):
                plugin = mod.register()
                self._modules[plugin.slug] = plugin

    def get_module(self, slug: str) -> BaseQuizModule:
        return self._modules.get(slug)
        
    def list_modules(self) -> list:
        return [{"slug": k, "title": v.title, "desc": v.description} for k, v in self._modules.items()]

registry = QuizRegistry()
