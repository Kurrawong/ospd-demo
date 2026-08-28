import importlib.util
import logging
import os
import pathlib
import shutil
import tempfile

import azure.functions as func

from patched_asgi_function_wrapper import AsgiFunctionApp


FUNCTION_DIR = pathlib.Path(__file__).parent


def prepare_reference_data() -> pathlib.Path:
    """Merge packaged Prez reference data with this project's overrides."""
    prez_spec = importlib.util.find_spec("prez")
    if prez_spec is None or not prez_spec.submodule_search_locations:
        raise RuntimeError("Cannot locate the installed Prez package")

    prez_package_dir = pathlib.Path(next(iter(prez_spec.submodule_search_locations)))
    packaged_reference_data = prez_package_dir / "reference_data"
    custom_reference_data = FUNCTION_DIR / "config"

    if not packaged_reference_data.is_dir():
        raise RuntimeError(
            f"Prez reference data does not exist at {packaged_reference_data}"
        )
    if not custom_reference_data.is_dir():
        raise RuntimeError(
            f"Custom reference data does not exist at {custom_reference_data}"
        )

    merged_reference_data = pathlib.Path(
        tempfile.mkdtemp(prefix="ospd-prez-reference-data-")
    )
    shutil.copytree(
        packaged_reference_data,
        merged_reference_data,
        dirs_exist_ok=True,
    )
    shutil.copytree(
        custom_reference_data,
        merged_reference_data,
        dirs_exist_ok=True,
    )
    return merged_reference_data


# Prez reads this variable while importing and assembling the application, so it
# must be set before prez.app is imported.
os.environ["PREZ_REFERENCE_DATA_DIR"] = str(prepare_reference_data())

try:
    from prez.app import assemble_app
except ImportError as exc:
    logging.exception("Cannot import Prez")
    raise RuntimeError(
        "Cannot import Prez in the Azure Function App. Check the Python dependencies."
    ) from exc


root_path = os.getenv("FUNCTION_APP_ROOT_PATH", "").strip()
if root_path == "/":
    root_path = ""

auth_level_name = os.getenv("FUNCTION_APP_AUTH_LEVEL", "FUNCTION").strip().upper()
auth_level = {
    "ADMIN": func.AuthLevel.ADMIN,
    "ANONYMOUS": func.AuthLevel.ANONYMOUS,
}.get(auth_level_name, func.AuthLevel.FUNCTION)

prez_app = assemble_app(root_path=root_path)
app = AsgiFunctionApp(app=prez_app, http_auth_level=auth_level)
