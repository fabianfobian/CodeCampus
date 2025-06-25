
{ pkgs }: {
  deps = [
    # Node.js and TypeScript
    pkgs.nodejs-20
    pkgs.nodePackages.typescript
    pkgs.nodePackages.tsx
    pkgs.nodePackages.ts-node
    
    # Python
    pkgs.python3
    pkgs.python311Packages.pip
    
    # Java
    pkgs.openjdk17
    
    # C/C++
    pkgs.gcc
    pkgs.gdb
    
    # Go
    pkgs.go
    
    # Rust
    pkgs.rustc
    pkgs.cargo
    
    # PHP
    pkgs.php
    
    # Ruby
    pkgs.ruby
    
    # C# and F#
    pkgs.mono
    pkgs.fsharp
    
    # Swift
    pkgs.swift
    
    # Kotlin
    pkgs.kotlin
    
    # Dart
    pkgs.dart
    
    # Scala
    pkgs.scala
    
    # Perl
    pkgs.perl
    
    # Additional tools
    pkgs.git
    pkgs.curl
    pkgs.wget
  ];
}
