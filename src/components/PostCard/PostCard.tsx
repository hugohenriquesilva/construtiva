import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { FeedPost } from '../../../types/home';
import { styles } from './PostCard.styles';

interface PostCardProps {
  post: FeedPost;
  onPress?: (post: FeedPost) => void;
}

export default function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(post)}
    >
      <Image source={{ uri: post.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.metaLine}>
          Post de: <Text style={styles.author}>{post.authorName}</Text>
          <Text style={styles.date}>  {post.date}</Text>
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {post.excerpt}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
