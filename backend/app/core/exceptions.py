from fastapi import HTTPException, status

class CommodityNotFoundError(HTTPException):
    def __init__(self, commodity_name: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commodity '{commodity_name}' not found in ICMR-NIN IFCT knowledge base."
        )

class MaterialNotFoundError(HTTPException):
    def __init__(self, material_name: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaging material '{material_name}' not found in certified bioplastics database."
        )

class RegulatoryViolationError(HTTPException):
    def __init__(self, reason: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Statutory FSSAI/BIS violation: {reason}"
        )

class InvalidOperationalParametersError(HTTPException):
    def __init__(self, reason: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid operational parameters: {reason}"
        )
