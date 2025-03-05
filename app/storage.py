import hashlib
import pickle
import os
import fcntl
from typing import Dict, Any

class UserStorage:
    def __init__(self, username: str, password: str, storage_path: str = "user_data.pkl"):
        hash_obj = hashlib.sha256((username + password).encode())
        self.user_hash = hash_obj.hexdigest()

        self.storage_path = storage_path
        if not os.path.exists(storage_path):
            with open(storage_path, 'wb') as f:
                pickle.dump({}, f)
    
    def load_user_data(self) -> Dict[str, Any]:
        with open(self.storage_path, 'rb') as file:
            data = pickle.load(file)
            return data.get(self.user_hash, {})
    
    def save_user_data(self, user_data: Dict[str, Any]) -> None:
        with open(self.storage_path, 'rb+') as file:
            fcntl.flock(file, fcntl.LOCK_EX)
            file.seek(0)
            data = pickle.load(file)
            data[self.user_hash] = user_data
            file.seek(0)
            file.truncate()
            pickle.dump(data, file)
            fcntl.flock(file, fcntl.LOCK_UN)
