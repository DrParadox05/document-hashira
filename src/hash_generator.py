import hashlib
import os

# Function to hash a file using SHA-256
def hash_file(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for byte_block in iter(lambda: f.read(4096), b''):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return None

# Function to create Merkle root from a list of hashes
def create_merkle_root(hashes):
    if len(hashes) == 1:
        return hashes[0]

    new_level = []
    
    for i in range(0, len(hashes), 2):
        left = hashes[i]
        right = hashes[i + 1] if i + 1 < len(hashes) else left  # Handle odd number of hashes
        combined_hash = hashlib.sha256((left + right).encode()).hexdigest()
        new_level.append(combined_hash)

    return create_merkle_root(new_level)

# Main function to hash files and generate Merkle root
def main():
    file_paths = ['files/bigFile1.txt', 'files/example.txt', 'files/bigFile1.txt']  # Example file paths
    document_hashes = []

    # Hash all files and collect the hashes
    for file_path in file_paths:
        file_hash = hash_file(file_path)
        if file_hash:  # Only add hash if the file was successfully read
            document_hashes.append(file_hash)

    print("Document Hashes:", document_hashes)

    if document_hashes:
        merkle_root = create_merkle_root(document_hashes)
        print("Merkle Root:", merkle_root)
    else:
        print("No valid file hashes were generated.")

if __name__ == "__main__":
    main()
